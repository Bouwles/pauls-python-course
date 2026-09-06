/* Lesson page. Everything here is rendered from one object in data/lessons.js. */
(function () {
  "use strict";

  var el = window.PPC.el;
  var icon = window.PPC.icon;
  var Progress = window.PPC.Progress;

  function pad(n) { return String(n).padStart(2, "0"); }

  function paragraphs(body) {
    var parts = Array.isArray(body) ? body : [body];
    return parts.filter(Boolean).map(function (text) {
      return el("p", { text: text });
    });
  }

  function pre(code) {
    var node = el("pre");
    var inner = el("code");
    inner.textContent = code;
    node.appendChild(inner);
    return node;
  }

  /* --- checks --------------------------------------------------------- */

  var DEFAULT_MESSAGES = {
    "output-not-empty": "Nothing came out yet. This one needs the program to print something.",
    "output-contains": "The output does not have everything I was looking for yet.",
    "output-matches": "The output is not quite the shape I was looking for yet.",
    "code-contains": "Something is missing from the code for this one.",
    "custom": "Not quite there yet."
  };

  function asList(value) { return Array.isArray(value) ? value : [value]; }

  function runOneCheck(check, ctx) {
    var out = ctx.output || "";
    var code = ctx.code || "";
    var ok;

    switch (check.type) {
      case "output-not-empty":
        ok = out.trim().length > 0;
        break;
      case "output-contains":
        ok = asList(check.value).every(function (needle) {
          return out.toLowerCase().indexOf(String(needle).toLowerCase()) !== -1;
        });
        break;
      case "output-matches":
        ok = (check.value instanceof RegExp ? check.value : new RegExp(check.value, check.flags || "")).test(out);
        break;
      case "code-contains":
        ok = asList(check.value).every(function (needle) {
          return code.toLowerCase().indexOf(String(needle).toLowerCase()) !== -1;
        });
        break;
      case "custom":
        ok = !!check.fn({ code: code, output: out });
        break;
      default:
        ok = true;
    }

    return {
      pass: ok,
      message: ok ? null : (check.message || DEFAULT_MESSAGES[check.type] || DEFAULT_MESSAGES.custom)
    };
  }

  function runChecks(check, ctx) {
    var list = Array.isArray(check) ? check : [check];
    for (var i = 0; i < list.length; i++) {
      var result = runOneCheck(list[i], ctx);
      if (!result.pass) return result;
    }
    return { pass: true, message: null };
  }

  /* --- sections -------------------------------------------------------- */

  function renderSection(section, index, lesson, registerRunner) {
    var anchor = "section-" + (index + 1);
    var heading = section.heading || ("Part " + (index + 1));

    var head = el("h2", { id: anchor + "-heading" }, [
      el("span", { class: "sec-num", text: pad(index + 1) }),
      heading
    ]);

    var wrap = el("section", {
      class: "lesson-section" + (section.type === "callout" ? " callout" : ""),
      id: anchor,
      "aria-labelledby": anchor + "-heading",
      "data-section-index": String(index)
    }, [head]);

    paragraphs(section.body).forEach(function (p) { wrap.appendChild(p); });

    if (section.type === "code") {
      if (section.runnable) {
        var runner = window.PPC.createRunner({
          code: section.code,
          label: heading + " example",
          name: "example.py"
        });
        wrap.appendChild(runner.node);
        registerRunner(runner);
      } else {
        wrap.appendChild(pre(section.code));
      }
      if (section.explain) wrap.appendChild(el("p", { class: "explain", text: section.explain }));
    }

    if (section.type === "mistake") {
      var pair = el("div", { class: "mistake-pair" }, [
        el("div", { class: "mistake-col wrong" }, [
          el("h3", {}, [icon("cross"), "Does not work"]),
          pre(section.wrong)
        ]),
        el("div", { class: "mistake-col right" }, [
          el("h3", {}, [icon("check"), "Works"]),
          pre(section.right)
        ])
      ]);
      wrap.appendChild(pair);
      if (section.why) wrap.appendChild(el("p", { class: "mistake-why", text: section.why }));
    }

    return { node: wrap, anchor: anchor, heading: heading };
  }

  /* --- practice --------------------------------------------------------- */

  function renderTask(task, index, lesson) {
    var done = Progress.get(lesson.id).practice.indexOf(String(task.id)) !== -1;
    var hasRun = false;

    var wrap = el("section", { class: "task" + (done ? " is-done" : ""), id: "task-" + task.id });

    var doneMark = el("span", { class: "task-done-mark" }, [icon("check"), "done"]);
    wrap.appendChild(el("div", { class: "task-head" }, [
      el("span", { class: "task-num", text: pad(index + 1) }),
      el("h3", { class: "task-prompt", text: task.prompt }),
      doneMark
    ]));

    var feedback = el("p", { class: "task-feedback", role: "status", "aria-live": "polite" });
    feedback.hidden = true;

    var checkBtn = el("button", { class: "btn", type: "button" }, [icon("check"), "Check"]);

    var runner = window.PPC.createRunner({
      code: task.starter || "",
      label: "Practice " + (index + 1) + ": " + task.prompt,
      name: "task" + (index + 1) + ".py",
      extraButtons: [checkBtn],
      onRun: function () {
        hasRun = true;
        if (revealLock) { revealLock.remove(); revealLock = null; }
        if (reveal) reveal.hidden = false;
      }
    });
    wrap.appendChild(runner.node);
    wrap.appendChild(feedback);

    /* hint + solution */
    var extras = el("div", { class: "task-extras" });
    var hintBtn = null;
    if (task.hint) {
      hintBtn = el("button", { class: "btn btn-quiet", type: "button" }, ["Give me a hint"]);
      hintBtn.addEventListener("click", function () { showFeedback(task.hint, "is-nudge"); });
      extras.appendChild(hintBtn);
    }
    wrap.appendChild(extras);

    var reveal = null;
    var revealLock = null;
    if (task.solution) {
      reveal = el("details", { class: "reveal" }, [
        el("summary", {}, [icon("chevron"), "Show me one way to do it"]),
        pre(task.solution)
      ]);
      reveal.hidden = true;
      revealLock = el("p", { class: "reveal-locked", text: "Have a go and press Run, then a worked answer appears here." });
      wrap.appendChild(revealLock);
      wrap.appendChild(reveal);
    }

    function showFeedback(text, cls) {
      feedback.className = "task-feedback " + (cls || "");
      feedback.textContent = text;
      feedback.hidden = false;
    }

    checkBtn.addEventListener("click", function () {
      checkBtn.disabled = true;
      runner.run().then(function (output) {
        hasRun = true;
        var result = runChecks(task.check, { code: runner.getCode(), output: output });
        if (result.pass) {
          wrap.classList.add("is-done");
          showFeedback("That works. Nice one.", "is-pass");
          Progress.markPracticeDone(lesson.id, task.id);
        } else {
          var message = result.message;
          if (task.hint) message += " Press the hint button if you want a nudge.";
          showFeedback(message, "is-nudge");
        }
        checkBtn.disabled = false;
      }, function () { checkBtn.disabled = false; });
    });

    return wrap;
  }

  /* --- sidebar + scrollspy ------------------------------------------------ */

  function mountSidebar(lesson, entries) {
    var toc = document.getElementById("toc");
    var links = entries.map(function (entry, i) {
      var a = el("a", { href: "#" + entry.anchor }, [entry.heading]);
      toc.appendChild(el("li", {}, [a]));
      return a;
    });

    /* extra jump targets that are not lesson sections */
    [["practice", "Practice"], ["quick-check", "Quick check"], ["cheatsheet-section", "Cheatsheet"]].forEach(function (pair) {
      var a = el("a", { href: "#" + pair[0] }, [pair[1]]);
      toc.appendChild(el("li", {}, [a]));
      links.push(a);
    });

    var objectives = document.getElementById("objectives");
    lesson.objectives.forEach(function (text) {
      objectives.appendChild(el("li", { text: text }));
    });

    /* mobile disclosure */
    var toggle = document.getElementById("sidebar-toggle");
    var panel = document.getElementById("sidebar-panel");
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      panel.classList.toggle("is-open", !open);
    });
    panel.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && window.matchMedia("(max-width: 61.99rem)").matches) {
        toggle.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
      }
    });

    /* highlight the section you are looking at, and count it as read */
    var targets = Array.prototype.slice.call(document.querySelectorAll("[data-spy]"));
    var visible = {};
    var dwell = {};

    var observer = new IntersectionObserver(function (records) {
      records.forEach(function (record) {
        var id = record.target.id;
        visible[id] = record.isIntersecting ? record.intersectionRatio : 0;

        /* count it as read only once it has been on screen for a moment,
           so scrolling straight past does not tick everything off */
        if (!record.target.hasAttribute("data-section-index")) return;
        if (record.isIntersecting) {
          if (!dwell[id]) {
            dwell[id] = window.setTimeout(function () {
              Progress.markSectionRead(lesson.id, record.target.getAttribute("data-section-index"));
            }, 1200);
          }
        } else {
          window.clearTimeout(dwell[id]);
          dwell[id] = null;
        }
      });
      var best = null;
      targets.forEach(function (node) {
        if (visible[node.id] && (!best || visible[node.id] > visible[best])) best = node.id;
      });
      if (!best) return;
      links.forEach(function (a) {
        a.classList.toggle("is-current", a.getAttribute("href") === "#" + best);
      });
    }, { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.6, 1] });

    targets.forEach(function (node) { observer.observe(node); });
  }

  /* --- page ---------------------------------------------------------------- */

  function idFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id") || (window.LESSONS && window.LESSONS[0] ? window.LESSONS[0].id : null);
  }

  function notFound() {
    document.getElementById("lesson-main").textContent = "";
    var wrap = el("div", { class: "wrap" }, [
      el("div", { class: "notfound" }, [
        el("p", { class: "lesson-eyebrow", text: "No such lesson" }),
        el("h1", { text: "That lesson is not here" }),
        el("p", { text: "It may not be written yet. The lessons that do exist are listed on the home page." }),
        el("p", {}, [el("a", { href: "index.html" }, ["Back to all lessons"])])
      ])
    ]);
    document.getElementById("lesson-main").appendChild(wrap);
  }

  function mount() {
    var lesson = window.PPC.lessonById(idFromUrl());
    if (!lesson) { notFound(); return; }

    document.title = "Lesson " + lesson.id + ": " + lesson.title + " - Paul's Python Course";
    Progress.setLastVisited(lesson.id);

    document.getElementById("lesson-eyebrow").textContent = "Lesson " + pad(lesson.id);
    document.getElementById("lesson-title").textContent = lesson.title;
    document.getElementById("lesson-lede").textContent = lesson.summary;

    var body = document.getElementById("lesson-sections");
    var runners = [];
    var entries = lesson.sections.map(function (section, i) {
      var rendered = renderSection(section, i, lesson, function (r) { runners.push(r); });
      rendered.node.setAttribute("data-spy", "");
      body.appendChild(rendered.node);
      return rendered;
    });

    var practiceHost = document.getElementById("practice-list");
    lesson.practice.forEach(function (task, i) {
      practiceHost.appendChild(renderTask(task, i, lesson));
    });

    /* the quiz itself lives on quiz.html; this page only points at it */
    var quizLink = document.getElementById("quiz-link");
    quizLink.href = "quiz.html?id=" + encodeURIComponent(lesson.id);
    quizLink.textContent = lesson.quiz.length + " questions on this lesson";
    quizLink.appendChild(icon("arrow"));
    if (Progress.get(lesson.id).quiz) {
      document.getElementById("quick-check-lede").textContent =
        "You have been through these once. They are on their own page, so you can come back to them any time.";
    }

    var sheet = document.getElementById("cheatsheet");
    lesson.cheatsheet.forEach(function (row) {
      var dt = el("dt");
      var codeNode = el("code");
      codeNode.textContent = row.code;
      dt.appendChild(codeNode);
      sheet.appendChild(el("div", { class: "cheat-row" }, [dt, el("dd", { text: row.meaning })]));
    });

    document.getElementById("next-up-text").textContent = lesson.next;

    mountSidebar(lesson, entries);

    /* CodeMirror measures wrong if it was laid out while hidden */
    window.setTimeout(function () {
      runners.forEach(function (r) { r.refresh(); });
    }, 300);
  }

  document.addEventListener("DOMContentLoaded", mount);
})();
