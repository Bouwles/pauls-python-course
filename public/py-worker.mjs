// The Workbench's Python worker. Runs Pyodide off the main thread so the page
// never freezes. Protocol: see lib/python/runtime.ts.
// Loaded as a module worker: Pyodide 314 no longer supports classic workers.
// The site may live under a path (GitHub Pages): find Python next to this file.
const BASE = new URL(".", self.location.href).pathname;

let pyodide = null;
let runtime = null;
let currentId = null;
let interrupt = null; // Int32Array over a SharedArrayBuffer, or null
let inputCtl = null; // Int32Array [state, length]: 0 idle, 1 waiting, 2 answered, 3 cancelled
let inputData = null; // Uint8Array for the typed answer
let sleeper = null;
const decoder = new TextDecoder();

function post(message) {
  self.postMessage(message);
}

function stopRequested() {
  return interrupt !== null && interrupt[0] === 2;
}

const bridge = {
  out(kind, text) {
    post({ type: "out", id: currentId, kind, text });
  },
  read_input(prompt) {
    if (!inputCtl) {
      // Without cross-origin isolation there is no way to block for input.
      post({ type: "input-unavailable", id: currentId });
      return null;
    }
    Atomics.store(inputCtl, 0, 1);
    post({ type: "input-request", id: currentId, prompt });
    for (;;) {
      Atomics.wait(inputCtl, 0, 1, 100);
      const state = Atomics.load(inputCtl, 0);
      if (state === 2) {
        const length = inputCtl[1];
        const text = decoder.decode(inputData.slice(0, length));
        Atomics.store(inputCtl, 0, 0);
        return text;
      }
      if (state === 3 || stopRequested()) {
        Atomics.store(inputCtl, 0, 0);
        if (interrupt) interrupt[0] = 0;
        return null;
      }
    }
  },
  sleep(seconds) {
    const end = performance.now() + seconds * 1000;
    while (performance.now() < end) {
      if (stopRequested()) {
        interrupt[0] = 0;
        return true;
      }
      const left = end - performance.now();
      if (sleeper) Atomics.wait(sleeper, 0, 0, Math.min(50, Math.max(0, left)));
    }
    return false;
  },
  event(name, json) {
    post({ type: "event", id: currentId, name, data: JSON.parse(json) });
  },
};

async function init(message) {
  if (message.buffers) {
    interrupt = new Int32Array(message.buffers.interrupt);
    inputCtl = new Int32Array(message.buffers.inputCtl);
    inputData = new Uint8Array(message.buffers.inputData);
    sleeper = new Int32Array(new SharedArrayBuffer(4));
  }
  post({ type: "loading", stage: "python" });
  const config = await (await fetch(`${BASE}python/config.json`)).json().catch(() => ({}));
  const { loadPyodide } = await import(`${BASE}pyodide/pyodide.mjs`);
  pyodide = await loadPyodide({
    indexURL: `${BASE}pyodide/`,
    packageBaseUrl: config.packageBaseUrl,
    stdout: (text) => post({ type: "out", id: currentId, kind: "out", text: text + "\n" }),
    stderr: (text) => post({ type: "out", id: currentId, kind: "err", text: text + "\n" }),
  });
  if (interrupt) pyodide.setInterruptBuffer(interrupt);
  pyodide.registerJsModule("ppc_bridge", bridge);
  pyodide.FS.mkdirTree("/home/pyodide/ppc");
  for (const name of ["workshop.py", "ppc_runtime.py"]) {
    const source = await (await fetch(`${BASE}python/${name}?v=${message.version || ""}`)).text();
    pyodide.FS.writeFile(`/home/pyodide/ppc/${name}`, source);
  }
  pyodide.runPython("import sys; sys.path.insert(0, '/home/pyodide/ppc'); import ppc_runtime");
  runtime = pyodide.pyimport("ppc_runtime");
  post({ type: "ready", version: pyodide.version, isolated: interrupt !== null });
}

let ready = null;

// Where each heavy package is fetched from, in town terms.
const FETCH_LINES = {
  numpy: "Fetching NumPy from the Records Office.",
  pandas: "Fetching pandas from the Records Office.",
  matplotlib: "Fetching matplotlib from the Weather Station.",
  "scikit-learn": "Fetching scikit-learn from the observatory.",
  scipy: "Fetching SciPy from the observatory.",
};

async function loadImports(request) {
  const sources = [...Object.entries(request.files || {}).filter(([n]) => n.endsWith(".py")).map(([, c]) => c), request.tests || ""].join("\n");
  if (!/^\s*(import|from)\s/m.test(sources)) return;
  const announced = new Set();
  await pyodide.loadPackagesFromImports(sources, {
    messageCallback: (msg) => {
      for (const [pkg, line] of Object.entries(FETCH_LINES)) {
        if (!announced.has(pkg) && msg.includes(`Loading ${pkg}`)) {
          announced.add(pkg);
          post({ type: "packages", id: currentId, message: line });
        }
      }
    },
    errorCallback: () => {},
  });
}

self.onmessage = async (event) => {
  const message = event.data;
  if (message.type === "init") {
    ready = init(message).catch((err) => {
      post({ type: "failed", message: String(err && err.message ? err.message : err) });
      throw err;
    });
    return;
  }
  if (message.type === "load-packages") {
    await ready;
    try {
      await pyodide.loadPackage(message.packages);
      post({ type: "packages-loaded", id: message.id });
    } catch (err) {
      post({ type: "crash", id: message.id, message: String(err) });
    }
    return;
  }
  await ready;
  currentId = message.id;
  if (interrupt) interrupt[0] = 0;
  try {
    await loadImports(message.request).catch((err) => post({ type: "packages", id: message.id, message: `Couldn't fetch a package: ${err}` }));
    const out = runtime[message.kind](JSON.stringify(message.request));
    post({ type: "result", id: message.id, result: JSON.parse(out) });
  } catch (err) {
    post({ type: "crash", id: message.id, message: String(err && err.message ? err.message : err) });
  } finally {
    currentId = null;
  }
};
