/* Quiz page. Two modes: an index of every lesson's quiz, or one quiz.
   Question types live in data/lessons.js - see the comment above quiz there. */
(function () {
  "use strict";

  var el = window.PPC.el;
  var icon = window.PPC.icon;
  var Progress = window.PPC.Progress;

  function pad(n) { return String(n).padStart(2, "0"); }

  function pre(code) {
    var node = el("pre");
    var inner = el("code");
    inner.textContent = code;
    node.appendChild(inner);
    return node;
  }

  /* --- index of all quizzes ------------------------------------------- */

  function renderIndex() {
    document.getElementById("quiz-eyebrow").textContent = "Quick check";
    document.getElementById("quiz-title").textContent = "Quizzes";
    document.getElementById("quiz-lede").textContent =
      "A few questions per lesson. Nothing is timed, nothing is scored against you, and you can retry any question.";

    var list = el("ul", { class: "lesson-list" });

    (window.LESSONS || []).forEach(function (lesson) {
      var entry = Progress.get(lesson.id);
      var title = el("h3", { class: "lesson-title", text: lesson.title });
      if (entry.quiz) title.appendChild(el("span", { class: "tag tag-done", text: "Done" }));

      list.appendChild(el("li", { class: "lesson-card" }, [
        el("a", { href: "quiz.html?id=" + encodeURIComponent(lesson.id) }, [
          el("span", { class: "lesson-index", text: pad(lesson.id) }),
          el("div", {}, [
            title,
            el("p", { class: "lesson-summary", text: lesson.quiz.length + " questions on " + lesson.summary })
          ])
        ])
      ]));
    });

    (window.UPCOMING || []).forEach(function (item) {
      var title = el("h3", { class: "lesson-title" });
      title.appendChild(document.createTextNode(item.title));
      title.appendChild(el("span", { class: "tag", text: "Locked" }));
      list.appendChild(el("li", { class: "lesson-card is-locked" }, [
        el("div", {}, [
          el("span", { class: "lesson-index", text: pad(item.id) }),
          el("div", {}, [
            title,
            el("p", { class: "lesson-summary", text: "Unlocks when the lesson is written." })
          ])
        ])
      ]));
    });

    document.getElementById("quiz-body").appendChild(list);
  }

  /* --- one quiz --------------------------------------------------------- */

  /* Typed answers: forgive spacing and quote style, nothing else.
     Python is case sensitive, so Print is still wrong. */
  function normalise(text) {
    return String(text).replace(/[‘’“”']/g, '"').replace(/\s+/g, " ").trim();
  }
  function normaliseHard(text) { return normalise(text).replace(/\s/g, ""); }

  function accepts(question, given) {
    return question.accept.some(function (answer) {
      return normalise(answer) === normalise(given) ||
             normaliseHard(answer) === normaliseHard(given);
    });
  }

  function renderQuiz(lesson) {
    document.title = "Lesson " + lesson.id + " quiz - Paul's Python Course";
    document.getElementById("quiz-eyebrow").textContent = "Lesson " + pad(lesson.id) + " quick check";
    document.getElementById("quiz-title").textContent = lesson.title;
    document.getElementById("quiz-lede").textContent =
      lesson.quiz.length + " questions. You get the reason either way, and you can try any of them again.";

    var host = document.getElementById("quiz-body");
    var back = el("p", { class: "quiz-back" }, [
      el("a", { href: "lesson.html?id=" + encodeURIComponent(lesson.id) }, ["Read lesson " + lesson.id + " again"])
    ]);

    var answered = {};   /* index -> true once answered at all */
    var missed = {};     /* index -> true if the first attempt was wrong */

    var counter = el("p", { class: "quiz-counter", role: "status", "aria-live": "polite" });
    var summary = el("section", { class: "quiz-summary", "aria-live": "polite" });
    summary.hidden = true;

    function updateCounter() {
      var done = Object.keys(answered).length;
      counter.textContent = done + " of " + lesson.quiz.length + " answered";
      if (done < lesson.quiz.length) { summary.hidden = true; return; }

      Progress.markQuizDone(lesson.id);
      buildSummary();
      summary.hidden = false;
    }

    function buildSummary() {
      summary.textContent = "";
      summary.appendChild(el("h2", { text: "That is all of them" }));

      var indexes = Object.keys(missed).map(Number);
      if (!indexes.length) {
        summary.appendChild(el("p", { text: "Every one right first time. Nothing to go back over." }));
        return;
      }

      /* the useful bit: which parts of the lesson are worth another read */
      var sections = [];
      indexes.forEach(function (i) {
        var ref = lesson.quiz[i].review;
        if (ref === undefined || ref === null) return;
        if (sections.indexOf(ref) === -1) sections.push(ref);
      });
      sections.sort(function (a, b) { return a - b; });

      if (!sections.length) {
        summary.appendChild(el("p", { text: "Have another go at the ones you found tricky whenever you like." }));
        return;
      }

      summary.appendChild(el("p", { text: "Worth another read before next lesson:" }));
      var list = el("ul", { class: "quiz-review" });
      sections.forEach(function (i) {
        var section = lesson.sections[i];
        if (!section) return;
        list.appendChild(el("li", {}, [
          el("a", {
            href: "lesson.html?id=" + encodeURIComponent(lesson.id) + "#section-" + (i + 1)
          }, [section.heading || ("Part " + (i + 1))])
        ]));
      });
      summary.appendChild(list);
    }

    function questionHead(question, index) {
      var head = el("h2", { class: "quiz-q" }, [
        el("span", { class: "task-num", text: pad(index + 1) }),
        el("span", { text: question.question })
      ]);
      return head;
    }

    function choiceQuestion(question, index, wrap) {
      var isCode = question.type === "predict" || question.optionsAreCode;
      var options = el("div", {
        class: "quiz-options" + (isCode ? " is-code" : ""),
        role: "group",
        "aria-label": question.question
      });
      var explain = el("p", { class: "quiz-explain", role: "status", "aria-live": "polite" });
      explain.hidden = true;
      var retry = el("button", { class: "btn btn-quiet", type: "button" }, ["Try this one again"]);
      retry.hidden = true;

      var buttons = question.options.map(function (text, i) {
        var label = el("span", { class: isCode ? "opt-code" : null });
        label.textContent = text;
        var btn = el("button", { class: "quiz-opt", type: "button" }, [icon("check", "mark"), label]);

        btn.addEventListener("click", function () {
          if (options.classList.contains("quiz-answered")) return;
          options.classList.add("quiz-answered");
          buttons.forEach(function (b) { b.disabled = true; });

          var correct = i === question.answer;
          btn.classList.add(correct ? "is-right" : "is-wrong");
          if (!correct) {
            buttons[question.answer].classList.add("is-right");
            btn.replaceChild(icon("cross", "mark"), btn.firstChild);
            if (answered[index] === undefined) missed[index] = true;
          }
          explain.textContent = (correct ? "Yes. " : "The answer is the one marked above. ") + question.explain;
          explain.hidden = false;
          retry.hidden = false;

          answered[index] = true;
          updateCounter();
        });

        options.appendChild(btn);
        return btn;
      });

      retry.addEventListener("click", function () {
        options.classList.remove("quiz-answered");
        buttons.forEach(function (b) {
          b.disabled = false;
          b.classList.remove("is-right", "is-wrong");
          b.replaceChild(icon("check", "mark"), b.firstChild);
        });
        explain.hidden = true;
        retry.hidden = true;
        buttons[0].focus();
      });

      wrap.appendChild(options);
      wrap.appendChild(explain);
      wrap.appendChild(el("div", { class: "quiz-actions" }, [retry]));
    }

    function writeQuestion(question, index, wrap) {
      var inputId = "write-" + index;
      var field = el("input", {
        type: "text",
        id: inputId,
        class: "quiz-write-field",
        spellcheck: "false",
        autocapitalize: "off",
        autocomplete: "off",
        autocorrect: "off",
        placeholder: question.placeholder || "type your answer",
        "aria-label": question.question
      });
      var submit = el("button", { class: "btn btn-primary", type: "submit" }, ["Check"]);
      var form = el("form", { class: "quiz-write" }, [field, submit]);

      var explain = el("p", { class: "quiz-explain", role: "status", "aria-live": "polite" });
      explain.hidden = true;
      var retry = el("button", { class: "btn btn-quiet", type: "button" }, ["Try this one again"]);
      retry.hidden = true;

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (form.classList.contains("quiz-answered")) return;
        if (!field.value.trim()) return;

        var correct = accepts(question, field.value);
        form.classList.add("quiz-answered", correct ? "is-right" : "is-wrong");
        field.readOnly = true;
        submit.disabled = true;

        if (!correct && answered[index] === undefined) missed[index] = true;
        explain.textContent = correct
          ? "Yes. " + question.explain
          : "One that works is " + question.accept[0] + ". " + question.explain;
        explain.hidden = false;
        retry.hidden = false;

        answered[index] = true;
        updateCounter();
      });

      retry.addEventListener("click", function () {
        form.classList.remove("quiz-answered", "is-right", "is-wrong");
        field.readOnly = false;
        submit.disabled = false;
        field.value = "";
        explain.hidden = true;
        retry.hidden = true;
        field.focus();
      });

      wrap.appendChild(form);
      wrap.appendChild(explain);
      wrap.appendChild(el("div", { class: "quiz-actions" }, [retry]));
    }

    host.appendChild(counter);

    lesson.quiz.forEach(function (question, index) {
      var wrap = el("section", { class: "quiz-item" }, [questionHead(question, index)]);
      if (question.code) wrap.appendChild(pre(question.code));
      if (question.type === "write") writeQuestion(question, index, wrap);
      else choiceQuestion(question, index, wrap);
      host.appendChild(wrap);
    });

    host.appendChild(summary);
    host.appendChild(back);
    updateCounter();
  }

  /* --- page -------------------------------------------------------------- */

  function mount() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    if (!id) { renderIndex(); return; }

    var lesson = window.PPC.lessonById(id);
    if (!lesson || !lesson.quiz || !lesson.quiz.length) {
      document.getElementById("quiz-eyebrow").textContent = "Not here";
      document.getElementById("quiz-title").textContent = "No quiz for that lesson";
      document.getElementById("quiz-lede").textContent = "It may not be written yet.";
      document.getElementById("quiz-body").appendChild(
        el("p", {}, [el("a", { href: "quiz.html" }, ["Back to all quizzes"])])
      );
      return;
    }
    renderQuiz(lesson);
  }

  document.addEventListener("DOMContentLoaded", mount);
})();
