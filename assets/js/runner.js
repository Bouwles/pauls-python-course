/* Pyodide, loaded lazily the first time anyone presses Run,
   plus the editor + output widget used everywhere on the site. */
(function () {
  "use strict";

  var PYODIDE_VERSION = "0.26.4";
  var PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v" + PYODIDE_VERSION + "/full/";
  var CM_BASE = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/";
  var FILENAME = "<your code>";

  /* Runs inside Pyodide once, at boot.

     input() is the awkward part: Python's input() is synchronous, but the
     inline prompt in the page is not. So before running a student's code we
     rewrite the syntax tree - input(...) becomes await __ppc_input(...), and
     any function that ends up containing an await is turned into an async
     def, along with the calls to it. The tree is compiled directly (never
     unparsed) so line numbers in tracebacks still match what they typed. */
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

  /* --- script loading ------------------------------------------------ */

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

  /* --- Pyodide ------------------------------------------------------- */

  var pyodidePromise = null;
  var queue = Promise.resolve();

  function boot(onProgress) {
    if (pyodidePromise) return pyodidePromise;
    if (onProgress) onProgress();
    pyodidePromise = loadScript(PYODIDE_URL + "pyodide.js")
      .then(function () { return window.loadPyodide({ indexURL: PYODIDE_URL }); })
      .then(function (py) {
        py.runPython(BOOT);
        return py;
      })
      .catch(function (err) {
        pyodidePromise = null;
        throw err;
      });
    return pyodidePromise;
  }

  /* Run one program. Calls are serialised because stdout is global.
     handlers: { onOutput(text), onInput(prompt) -> Promise<string> } */
  function exec(code, handlers) {
    var task = queue.then(function () {
      return boot(handlers.onBooting).then(function (py) {
        py.setStdout({ batched: function (line) { handlers.onOutput(line + "\n"); } });
        py.setStderr({ batched: function (line) { handlers.onOutput(line + "\n"); } });

        py.globals.set("__ppc_src", code);
        py.globals.set("__ppc_ainput", function (prompt) {
          return Promise.resolve(handlers.onInput(prompt === undefined || prompt === null ? "" : String(prompt)));
        });

        return py.runPythonAsync("await __ppc_run(__ppc_src, __ppc_ainput)")
          .then(function (traceback) { return traceback || null; });
      });
    });
    /* keep the chain alive even when a run blows up */
    queue = task.then(function () {}, function () {});
    return task;
  }

  /* --- CodeMirror ----------------------------------------------------- */

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

  /* options: { code, label, name, onRun(outputText), extraButtons: [node] } */
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
    var copyBtn = el("button", { class: "btn", type: "button", "aria-label": "Copy code" }, [icon("copy"), "Copy"]);

    var bar = el("div", { class: "runner-bar" }, [
      el("span", { class: "runner-name", text: options.name || "main.py" })
    ]);
    (options.extraButtons || []).forEach(function (node) { bar.appendChild(node); });
    bar.appendChild(copyBtn);
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
    }

    function status(text) {
      var node = el("span", { class: "out-status" });
      node.appendChild(el("span", { class: "spinner" }));
      node.appendChild(document.createTextNode(text));
      out.appendChild(node);
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

        function done() {
          var value = field.value;
          row.remove();
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

    function run() {
      if (running) return Promise.resolve("");
      running = true;
      runBtn.disabled = true;
      clearOut();
      var booting = null;

      return exec(getCode(), {
        onBooting: function () {
          booting = status("Starting Python. This takes a few seconds the first time.");
        },
        onOutput: function (text) {
          if (booting) { booting.remove(); booting = null; }
          push(text);
        },
        onInput: function (prompt) {
          if (booting) { booting.remove(); booting = null; }
          return askForInput(prompt);
        }
      }).then(function (traceback) {
        if (booting) { booting.remove(); booting = null; }
        if (traceback) {
          push(traceback.replace(/\s+$/, "") + "\n", "out-err");
          var hint = window.PPC_explainError ? window.PPC_explainError(traceback) : null;
          if (hint) push(hint, "out-hint");
        } else if (out.childNodes.length === 0) {
          push("Ran with no output. Nothing was printed.", "out-status");
        }
        return plain;
      }, function (err) {
        if (booting) { booting.remove(); booting = null; }
        push("Python could not be loaded. Check your internet connection and try again.\n", "out-err");
        if (err && err.message) push(String(err.message), "out-status");
        return plain;
      }).then(function (result) {
        running = false;
        runBtn.disabled = false;
        if (options.onRun) options.onRun(result, getCode());
        return result;
      });
    }

    runBtn.addEventListener("click", run);

    copyBtn.addEventListener("click", function () {
      var text = getCode();
      var restore = function () {
        copyBtn.innerHTML = "";
        copyBtn.appendChild(icon("check"));
        copyBtn.appendChild(document.createTextNode("Copied"));
        window.setTimeout(function () {
          copyBtn.innerHTML = "";
          copyBtn.appendChild(icon("copy"));
          copyBtn.appendChild(document.createTextNode("Copy"));
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
})();
