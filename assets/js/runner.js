/* Pyodide, loaded lazily the first time anyone presses Run,
   plus the editor + output widget used everywhere on the site.

   Python runs in a Web Worker, not on this thread. That is what makes a
   student's infinite loop survivable: the page stays responsive and the Stop
   button can terminate the worker outright. The worker is built from a Blob
   so that opening index.html straight off the disk still works - a worker
   loaded from a file:// path is blocked, a blob: one is not. */
(function () {
  "use strict";

  var PYODIDE_VERSION = "0.26.4";
  var PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v" + PYODIDE_VERSION + "/full/";
  var CM_BASE = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/";
  var FILENAME = "<your code>";

  /* A runaway loop can print faster than any page can render. The worker
     keeps the first MAX_LINES lines of a run and counts the rest, so memory
     and the DOM both stay flat while `while True` spins. */
  var MAX_LINES = 2000;
  var FLUSH_MS = 50;
  var SLOW_MS = 5000;

  /* Runs inside Pyodide once, at boot.

     input() is the awkward part: Python's input() is synchronous, but the
     inline prompt in the page is not. So before running a student's code we
     rewrite the syntax tree - input(...) becomes await __ppc_input(...), and
     any function that ends up containing an await is turned into an async
     def, along with the calls to it. The tree is compiled directly (never
     unparsed) so line numbers in tracebacks still match what they typed.

     The same rewrite is what lets input() work from inside a worker without
     SharedArrayBuffer: __ppc_input returns a JS promise that settles when the
     page posts the typed answer back. */
  var BOOT = [
    "import ast, sys, traceback, linecache",
    "",
    "_FILE = " + JSON.stringify(FILENAME),
    "",
    "class _Rewrite(ast.NodeTransformer):",
    "    def __init__(self, async_names):",
    "        self.async_names = async_names",
    "    def visit_Call(self, node):",
    "        self.generic_visit(node)",
    "        if isinstance(node.func, ast.Name):",
    "            if node.func.id == 'input':",
    "                node.func = ast.Name(id='__ppc_input', ctx=ast.Load())",
    "                return ast.Await(value=node)",
    "            if node.func.id in self.async_names:",
    "                return ast.Await(value=node)",
    "        return node",
    "    def visit_FunctionDef(self, node):",
    "        self.generic_visit(node)",
    "        if node.name not in self.async_names:",
    "            return node",
    "        new = ast.AsyncFunctionDef(",
    "            name=node.name, args=node.args, body=node.body,",
    "            decorator_list=node.decorator_list, returns=node.returns,",
    "            type_comment=None, type_params=getattr(node, 'type_params', []))",
    "        return ast.copy_location(new, node)",
    "",
    "def _needs_async(tree):",
    "    funcs = {}",
    "    for node in ast.walk(tree):",
    "        if isinstance(node, ast.FunctionDef):",
    "            funcs[node.name] = node",
    "    marked = set()",
    "    changed = True",
    "    while changed:",
    "        changed = False",
    "        for name, node in funcs.items():",
    "            if name in marked:",
    "                continue",
    "            for inner in ast.walk(node):",
    "                if isinstance(inner, ast.Call) and isinstance(inner.func, ast.Name):",
    "                    if inner.func.id == 'input' or inner.func.id in marked:",
    "                        marked.add(name)",
    "                        changed = True",
    "                        break",
    "    return marked",
    "",
    "async def __ppc_run(src, ainput):",
    "    scope = {'__name__': '__main__', '__ppc_input': ainput}",
    "    linecache.cache[_FILE] = (len(src), None, src.splitlines(True), _FILE)",
    "    try:",
    "        tree = ast.parse(src, _FILE, 'exec')",
    "    except SyntaxError as exc:",
    "        return ''.join(traceback.format_exception_only(type(exc), exc))",
    "    try:",
    "        tree = _Rewrite(_needs_async(tree)).visit(tree)",
    "        ast.fix_missing_locations(tree)",
    "        code = compile(tree, _FILE, 'exec', flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)",
    "    except SyntaxError as exc:",
    "        return ''.join(traceback.format_exception_only(type(exc), exc))",
    "    try:",
    "        result = eval(code, scope, scope)",
    "        if result is not None:",
    "            await result",
    "    except BaseException as exc:",
    "        tb = exc.__traceback__",
    "        while tb is not None and tb.tb_frame.f_code.co_filename != _FILE:",
    "            tb = tb.tb_next",
    "        return ''.join(traceback.format_exception(type(exc), exc, tb))",
    "    finally:",
    "        try:",
    "            sys.stdout.flush()",
    "            sys.stderr.flush()",
    "        except Exception:",
    "            pass",
    "    return None",
    ""
  ].join("\n");

  /* --- the worker ------------------------------------------------------ */

  /* Written as a real function and stringified into a Blob, so it stays
     readable and there is still no build step. Nothing outside this function
     is in scope when it runs. */
  function workerBody() {
    "use strict";
    var py = null;
    var buf = [];
    var lines = 0;
    var dropped = 0;
    var timer = null;
    var lastFlush = 0;
    var maxLines = 2000;
    var flushMs = 50;
    var pending = {};
    var inputSeq = 0;

    function flushNow() {
      if (timer !== null) { clearTimeout(timer); timer = null; }
      lastFlush = Date.now();
      if (!buf.length && !dropped) return;
      self.postMessage({ type: "out", text: buf.join(""), dropped: dropped });
      buf = [];
      dropped = 0;
    }

    /* `while True: print(...)` never gives the worker's event loop a turn, so
       a timer alone would never fire and the page would show nothing at all
       while the loop spun. stdout calls this synchronously, so the elapsed
       check here is the only thing that gets output out during a runaway
       loop. The timer is just the backstop for the last few lines. */
    function write(text) {
      lines++;
      if (lines <= maxLines) buf.push(text); else dropped++;
      if (Date.now() - lastFlush >= flushMs) flushNow();
      else if (timer === null) timer = setTimeout(flushNow, flushMs);
    }

    self.onmessage = function (event) {
      var msg = event.data || {};

      if (msg.type === "boot") {
        maxLines = msg.maxLines || maxLines;
        flushMs = msg.flushMs || flushMs;
        try {
          importScripts(msg.pyodideUrl + "pyodide.js");
        } catch (err) {
          self.postMessage({ type: "boot-failed", text: String(err) });
          return;
        }
        loadPyodide({ indexURL: msg.pyodideUrl }).then(function (instance) {
          py = instance;
          py.setStdout({ batched: function (line) { write(line + "\n"); } });
          py.setStderr({ batched: function (line) { write(line + "\n"); } });
          py.runPython(msg.boot);
          py.globals.set("__ppc_ainput", function (prompt) {
            return new Promise(function (resolve) {
              var id = ++inputSeq;
              pending[id] = resolve;
              /* everything printed before the question has to be on screen
                 before the question is asked */
              flushNow();
              self.postMessage({
                type: "input",
                id: id,
                prompt: prompt === undefined || prompt === null ? "" : String(prompt)
              });
            });
          });
          self.postMessage({ type: "ready" });
        }, function (err) {
          self.postMessage({ type: "boot-failed", text: String(err) });
        });
        return;
      }

      if (msg.type === "input-result") {
        var resolve = pending[msg.id];
        if (resolve) { delete pending[msg.id]; resolve(msg.value); }
        return;
      }

      if (msg.type === "run") {
        buf = [];
        lines = 0;
        dropped = 0;
        py.globals.set("__ppc_src", msg.code);
        py.runPythonAsync("await __ppc_run(__ppc_src, __ppc_ainput)").then(function (traceback) {
          flushNow();
          self.postMessage({
            type: "done",
            traceback: traceback || null,
            lines: lines,
            truncated: lines > maxLines
          });
        }, function (err) {
          flushNow();
          self.postMessage({ type: "done", traceback: String(err), lines: lines, truncated: false });
        });
      }
    };
  }

  var workerUrl = null;
  function makeWorker() {
    if (!workerUrl) {
      var source = "(" + workerBody.toString() + ")();";
      workerUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
    }
    return new Worker(workerUrl);
  }

  /* --- worker lifecycle ------------------------------------------------- */

  var wk = null;       /* { worker, ready } */
  var current = null;  /* the run in flight */

  function spawn() {
    var worker = makeWorker();
    var entry = { worker: worker, ready: null };

    entry.ready = new Promise(function (resolve, reject) {
      worker.onmessage = function (event) {
        var msg = event.data || {};
        if (msg.type === "ready") { entry.booted = true; resolve(); return; }
        if (msg.type === "boot-failed") { reject(new Error(msg.text)); return; }
        route(msg);
      };
      worker.onerror = function (event) {
        reject(new Error(event.message || "Python could not be started."));
      };
    });

    entry.ready.catch(function () {
      /* a worker that never booted is no use to the next run either */
      if (wk === entry) wk = null;
    });

    worker.postMessage({
      type: "boot",
      boot: BOOT,
      pyodideUrl: PYODIDE_URL,
      maxLines: MAX_LINES,
      flushMs: FLUSH_MS
    });
    return entry;
  }

  function ensure() {
    if (!wk) wk = spawn();
    return wk;
  }

  function route(msg) {
    if (!current) return;
    if (msg.type === "out") {
      current.handlers.onOutput(msg.text, msg.dropped || 0);
      return;
    }
    if (msg.type === "input") {
      var worker = current.worker;
      Promise.resolve(current.handlers.onInput(msg.prompt)).then(function (value) {
        /* the run may have been stopped while they were typing */
        if (current && current.worker === worker) {
          worker.postMessage({ type: "input-result", id: msg.id, value: String(value) });
        }
      });
      return;
    }
    if (msg.type === "done") {
      var finish = current.finish;
      current = null;
      finish({ traceback: msg.traceback || null, stopped: false, truncated: !!msg.truncated, lines: msg.lines || 0 });
    }
  }

  /* Kill whatever is running. The worker is thrown away, because the only
     way to interrupt Python mid-loop is to terminate it, and a fresh one is
     started straight away so the next Run is not slow. */
  function stop() {
    if (!wk) return false;
    var running = current;
    if (wk.worker) wk.worker.terminate();
    wk = null;
    current = null;
    if (running) running.finish({ traceback: null, stopped: true, truncated: false, lines: 0 });
    ensure();  /* warm up a replacement in the background */
    return !!running;
  }

  /* Run one program. Calls are serialised because stdout is global.
     handlers: { onBooting(), onOutput(text, dropped), onInput(prompt) -> Promise<string> }
     Resolves to { traceback, stopped, truncated, lines }. */
  var queue = Promise.resolve();

  function exec(code, handlers) {
    var task = queue.then(function () {
      var entry = ensure();
      /* only say "starting Python" when it really is starting */
      if (!entry.booted && handlers.onBooting) handlers.onBooting();
      return entry.ready.then(function () {
        return new Promise(function (resolve) {
          current = { handlers: handlers, finish: resolve, worker: entry.worker };
          entry.worker.postMessage({ type: "run", code: code });
        });
      });
    });
    queue = task.then(function () {}, function () {});
    return task;
  }

  /* --- CodeMirror ----------------------------------------------------- */

  var scriptCache = {};
  function loadScript(src) {
    if (scriptCache[src]) return scriptCache[src];
    scriptCache[src] = new Promise(function (resolve, reject) {
      var tag = document.createElement("script");
      tag.src = src;
      tag.async = true;
      tag.onload = resolve;
      tag.onerror = function () { reject(new Error("Could not load " + src)); };
      document.head.appendChild(tag);
    });
    return scriptCache[src];
  }

  function loadStyle(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  var cmPromise = null;
  function loadCodeMirror() {
    if (cmPromise) return cmPromise;
    loadStyle(CM_BASE + "codemirror.min.css");
    cmPromise = loadScript(CM_BASE + "codemirror.min.js")
      .then(function () { return loadScript(CM_BASE + "mode/python/python.min.js"); })
      .then(function () { return window.CodeMirror; })
      .catch(function () { return null; });
    return cmPromise;
  }

  /* --- the widget ------------------------------------------------------ */

  var uid = 0;

  /* options: { code, label, name, onRun(outputText, code), extraButtons: [node] } */
  function createRunner(options) {
    var el = window.PPC.el;
    var icon = window.PPC.icon;
    var id = "runner-" + (++uid);
    var label = options.label || "Python code";

    var textarea = el("textarea", {
      id: id,
      spellcheck: "false",
      autocapitalize: "off",
      autocomplete: "off",
      autocorrect: "off",
      "aria-label": label,
      rows: String(Math.max(3, (options.code || "").split("\n").length))
    });
    textarea.value = options.code || "";

    var runBtn = el("button", { class: "btn btn-primary", type: "button" }, [icon("play"), "Run"]);
    var stopBtn = el("button", { class: "btn btn-stop", type: "button" }, [icon("stop"), "Stop"]);
    stopBtn.hidden = true;
    /* the label is wrapped so narrow screens can drop it and keep the icon */
    function copyLabel(text) { return el("span", { class: "btn-copy-text", text: text }); }
    var copyBtn = el("button", { class: "btn", type: "button", "aria-label": "Copy code" }, [icon("copy"), copyLabel("Copy")]);

    var bar = el("div", { class: "runner-bar" }, [
      el("span", { class: "runner-name", text: options.name || "main.py" })
    ]);
    (options.extraButtons || []).forEach(function (node) { bar.appendChild(node); });
    bar.appendChild(copyBtn);
    bar.appendChild(stopBtn);
    bar.appendChild(runBtn);

    var editorWrap = el("div", { class: "runner-editor" }, [textarea]);
    var out = el("div", {
      class: "runner-out",
      role: "log",
      "aria-live": "polite",
      "aria-label": label + " output",
      tabindex: "0"
    });

    var root = el("div", { class: "runner" }, [bar, editorWrap, out]);

    var cm = null;
    loadCodeMirror().then(function (CodeMirror) {
      if (!CodeMirror || cm) return;
      cm = CodeMirror.fromTextArea(textarea, {
        mode: "python",
        theme: "ppc",
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        smartIndent: true,
        lineWrapping: true,
        viewportMargin: Infinity,
        inputStyle: "contenteditable",
        extraKeys: {
          Tab: function (editor) { editor.replaceSelection("    "); },
          "Ctrl-Enter": function () { runBtn.click(); },
          "Cmd-Enter": function () { runBtn.click(); }
        }
      });
      cm.getInputField().setAttribute("aria-label", label);
    });

    function getCode() { return cm ? cm.getValue() : textarea.value; }
    function setCode(value) {
      if (cm) cm.setValue(value); else textarea.value = value;
    }

    /* --- output area ---------------------------------------------------- */

    var plain = "";

    function clearOut() { out.textContent = ""; plain = ""; }

    function push(text, className) {
      var node = el("span", className ? { class: className } : null);
      node.textContent = text;
      out.appendChild(node);
      out.scrollTop = out.scrollHeight;
      if (!className || className === "out-echo") plain += text;
      return node;
    }

    function status(text) {
      var node = el("span", { class: "out-status" });
      node.appendChild(el("span", { class: "spinner" }));
      node.appendChild(document.createTextNode(text));
      out.appendChild(node);
      out.scrollTop = out.scrollHeight;
      return node;
    }

    function askForInput(prompt) {
      return new Promise(function (resolve) {
        var field = el("input", {
          type: "text",
          "aria-label": prompt ? prompt : "Input for your program",
          autocapitalize: "off",
          autocomplete: "off",
          spellcheck: "false"
        });
        var send = el("button", { class: "btn btn-primary", type: "button" }, ["Enter"]);
        var row = el("div", { class: "stdin-row" }, []);
        if (prompt) {
          var promptNode = el("span");
          promptNode.textContent = prompt;
          row.appendChild(promptNode);
        }
        row.appendChild(field);
        row.appendChild(send);
        out.appendChild(row);
        out.scrollTop = out.scrollHeight;
        field.focus();
        stdinRow = row;

        function done() {
          var value = field.value;
          row.remove();
          if (stdinRow === row) stdinRow = null;
          /* keep the question and the answer in the transcript */
          if (prompt) push(prompt);
          push(value + "\n", "out-echo");
          resolve(value);
        }
        send.addEventListener("click", done);
        field.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); done(); }
        });
      });
    }

    var running = false;
    var stdinRow = null;
    var droppedTotal = 0;
    var droppedNode = null;
    var slowTimer = null;
    var slowNode = null;

    /* Some legitimate loops are slow, so nothing is ever killed automatically.
       After a few seconds it just says so, and points at the Stop button. */
    function startSlowWatch() {
      slowTimer = window.setTimeout(function () {
        slowTimer = null;
        if (!running) return;
        slowNode = status("Still running. Press Stop if it should have finished by now.");
      }, SLOW_MS);
    }

    function clearRunState() {
      if (slowTimer) { window.clearTimeout(slowTimer); slowTimer = null; }
      if (slowNode) { slowNode.remove(); slowNode = null; }
      if (stdinRow) { stdinRow.remove(); stdinRow = null; }
      droppedNode = null;
      droppedTotal = 0;
    }

    function noteDropped(count) {
      droppedTotal += count;
      if (!droppedTotal) return;
      var text = "\n... and " + droppedTotal.toLocaleString() + " more lines, not shown.\n";
      if (droppedNode) droppedNode.textContent = text;
      else droppedNode = push(text, "out-status");
      out.scrollTop = out.scrollHeight;
    }

    function run() {
      if (running) return Promise.resolve("");
      running = true;
      runBtn.disabled = true;
      stopBtn.hidden = false;
      clearOut();
      clearRunState();
      var booting = null;
      startSlowWatch();

      return exec(getCode(), {
        onBooting: function () {
          booting = status("Starting Python. This takes a few seconds the first time.");
        },
        onOutput: function (text, dropped) {
          if (booting) { booting.remove(); booting = null; }
          if (text) push(text);
          if (dropped) noteDropped(dropped);
        },
        onInput: function (prompt) {
          if (booting) { booting.remove(); booting = null; }
          /* waiting on a person is not a slow program */
          if (slowTimer) { window.clearTimeout(slowTimer); slowTimer = null; }
          if (slowNode) { slowNode.remove(); slowNode = null; }
          return askForInput(prompt).then(function (value) {
            startSlowWatch();
            return value;
          });
        }
      }).then(function (result) {
        if (booting) { booting.remove(); booting = null; }
        clearRunState();

        if (result.stopped) {
          push("\nStopped. Your code is still in the editor.\n", "out-status");
        } else if (result.traceback) {
          push(result.traceback.replace(/\s+$/, "") + "\n", "out-err");
          var hint = window.PPC_explainError ? window.PPC_explainError(result.traceback) : null;
          if (hint) push(hint, "out-hint");
        } else if (plain.trim() === "") {
          var quiet = window.PPC_explainSilence ? window.PPC_explainSilence(getCode()) : null;
          push(quiet || "Ran with no output. Nothing was printed.", "out-status");
        }
        return plain;
      }, function (err) {
        if (booting) { booting.remove(); booting = null; }
        clearRunState();
        push("Python could not be loaded. Check your internet connection and try again.\n", "out-err");
        if (err && err.message) push(String(err.message), "out-status");
        return plain;
      }).then(function (result) {
        running = false;
        runBtn.disabled = false;
        stopBtn.hidden = true;
        if (options.onRun) options.onRun(result, getCode());
        return result;
      });
    }

    runBtn.addEventListener("click", run);
    stopBtn.addEventListener("click", function () {
      stopBtn.disabled = true;
      stop();
      window.setTimeout(function () { stopBtn.disabled = false; }, 200);
    });

    copyBtn.addEventListener("click", function () {
      var text = getCode();
      var restore = function () {
        copyBtn.textContent = "";
        copyBtn.appendChild(icon("check"));
        copyBtn.appendChild(copyLabel("Copied"));
        window.setTimeout(function () {
          copyBtn.textContent = "";
          copyBtn.appendChild(icon("copy"));
          copyBtn.appendChild(copyLabel("Copy"));
        }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(restore, fallbackCopy);
      } else {
        fallbackCopy();
      }
      function fallbackCopy() {
        var tmp = document.createElement("textarea");
        tmp.value = text;
        tmp.setAttribute("readonly", "");
        tmp.style.position = "fixed";
        tmp.style.opacity = "0";
        document.body.appendChild(tmp);
        tmp.select();
        try { document.execCommand("copy"); restore(); } catch (e) { /* nothing else to try */ }
        tmp.remove();
      }
    });

    return {
      node: root,
      run: run,
      getCode: getCode,
      setCode: setCode,
      outputText: function () { return plain; },
      refresh: function () { if (cm) cm.refresh(); }
    };
  }

  window.PPC = window.PPC || {};
  window.PPC.createRunner = createRunner;
  window.PPC.pyExec = exec;
  window.PPC.pyStop = stop;
})();
