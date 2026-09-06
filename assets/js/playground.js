/* Playground: one editor, one output, code kept in localStorage. */
(function () {
  "use strict";

  var el = window.PPC.el;
  var KEY = "ppc:playground:v1";
  var DEFAULT_CODE = '# Anything you like. Nothing here is marked.\nprint("Hello")\n';

  function load() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(code) {
    try { localStorage.setItem(KEY, code); } catch (e) { /* no storage, carry on */ }
  }

  function snippets() {
    var out = [];
    (window.LESSONS || []).forEach(function (lesson) {
      (lesson.cheatsheet || []).forEach(function (row) {
        out.push({
          label: row.code + "  -  " + row.meaning,
          code: exampleFor(row.code)
        });
      });
    });
    return out;
  }

  /* Cheatsheet entries are fragments. Turn each into something runnable. */
  function exampleFor(fragment) {
    if (fragment.indexOf("input(") === 0) {
      return 'answer = input("What is your name? ")\nprint(answer)\n';
    }
    if (fragment.indexOf("#") === 0) {
      return '# this line is skipped\nprint("this line is not")\n';
    }
    if (fragment.indexOf("name = value") === 0) {
      return 'name = "Sara"\nprint(name)\n';
    }
    if (fragment.indexOf("+") !== -1) {
      return 'name = "Sara"\nprint("Hi " + name)\n';
    }
    if (fragment.indexOf('"text"') === 0) {
      return 'print("text is anything inside quotes")\n';
    }
    return 'x = 5\nprint(x)\n';
  }

  function mount() {
    var host = document.getElementById("playground");
    if (!host) return;

    var runner = window.PPC.createRunner({
      code: load() || DEFAULT_CODE,
      label: "Playground code",
      name: "playground.py"
    });
    runner.node.classList.add("pg-runner");
    host.appendChild(runner.node);

    /* save on the way out and every few seconds of typing */
    var timer = null;
    function scheduleSave() {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { save(runner.getCode()); }, 600);
    }
    runner.node.addEventListener("keyup", scheduleSave);
    runner.node.addEventListener("input", scheduleSave);
    window.addEventListener("beforeunload", function () { save(runner.getCode()); });
    window.addEventListener("pagehide", function () { save(runner.getCode()); });

    var select = document.getElementById("snippet-select");
    var items = snippets();
    items.forEach(function (item, i) {
      select.appendChild(el("option", { value: String(i), text: item.label }));
    });
    select.addEventListener("change", function () {
      var item = items[Number(select.value)];
      if (!item) return;
      runner.setCode(item.code);
      save(item.code);
      select.value = "";
    });
  }

  document.addEventListener("DOMContentLoaded", mount);
})();
