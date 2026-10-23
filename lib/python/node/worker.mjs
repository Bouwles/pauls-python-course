// Pyodide worker thread for Node: content tests, build-time test descriptions,
// and unit tests. Mirrors public/py-worker.mjs, minus interactive input.
import { parentPort, workerData } from "node:worker_threads";
import { readFileSync } from "node:fs";
import path from "node:path";
import { loadPyodide } from "pyodide";

const interrupt = new Int32Array(workerData.interrupt);
const sleeper = new Int32Array(new SharedArrayBuffer(4));
let currentId = null;

const py = await loadPyodide({ stdout: () => {}, stderr: () => {} });
py.setInterruptBuffer(interrupt);
py.registerJsModule("ppc_bridge", {
  out(kind, text) {
    parentPort.postMessage({ type: "out", id: currentId, kind, text });
  },
  read_input() {
    // Content checks always script their inputs; reaching this is a content bug.
    return null;
  },
  sleep(seconds) {
    const end = performance.now() + seconds * 1000;
    while (performance.now() < end) {
      if (interrupt[0] === 2) {
        interrupt[0] = 0;
        return true;
      }
      Atomics.wait(sleeper, 0, 0, Math.min(50, end - performance.now()));
    }
    return false;
  },
  event(name, json) {
    parentPort.postMessage({ type: "event", id: currentId, name, data: JSON.parse(json) });
  },
});
py.FS.mkdirTree("/home/pyodide/ppc");
py.FS.writeFile("/home/pyodide/ppc/ppc_runtime.py", readFileSync(workerData.runtimePath, "utf8"));
py.FS.writeFile("/home/pyodide/ppc/saltmarsh.py", readFileSync(path.join(path.dirname(workerData.runtimePath), "saltmarsh.py"), "utf8"));
py.runPython("import sys; sys.path.insert(0, '/home/pyodide/ppc'); import ppc_runtime");
const runtime = py.pyimport("ppc_runtime");
parentPort.postMessage({ type: "ready", version: py.version });

async function loadImports(request) {
  const sources = [...Object.entries(request.files || {}).filter(([n]) => n.endsWith(".py")).map(([, c]) => c), request.tests || ""].join("\n");
  if (/^\s*(import|from)\s/m.test(sources)) await py.loadPackagesFromImports(sources, { messageCallback: () => {}, errorCallback: () => {} });
}

parentPort.on("message", async (msg) => {
  currentId = msg.id;
  try {
    await loadImports(msg.request);
    const out = runtime[msg.kind](JSON.stringify(msg.request));
    parentPort.postMessage({ type: "result", id: msg.id, result: JSON.parse(out) });
  } catch (err) {
    parentPort.postMessage({ type: "crash", id: msg.id, message: String(err && err.message ? err.message : err) });
  }
});
