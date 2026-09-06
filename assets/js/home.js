/* Home page: lesson list, progress bars, continue button. */
(function () {
  "use strict";

  var el = window.PPC.el;
  var icon = window.PPC.icon;
  var Progress = window.PPC.Progress;

  function pad(n) { return String(n).padStart(2, "0"); }

  function progressBar(summary) {
    var percent = summary.total ? Math.round((summary.done / summary.total) * 100) : 0;
    var fill = el("span", { class: "progress-fill" });
    fill.style.width = percent + "%";
    var track = el("div", { class: "progress-track", "aria-hidden": "true" }, [fill]);
    return el("div", { class: "progress" }, [
      track,
      el("span", {
        class: "progress-count",
        text: summary.done + " of " + summary.total + " done"
      })
    ]);
  }

  function lessonCard(lesson) {
    var summary = Progress.summary(lesson);
    var link = el("a", { href: "lesson.html?id=" + encodeURIComponent(lesson.id) }, [
      el("span", { class: "lesson-index", text: pad(lesson.id) }),
      el("div", {}, [
        el("h3", { class: "lesson-title", text: lesson.title }),
        el("p", { class: "lesson-summary", text: lesson.summary }),
        progressBar(summary)
      ])
    ]);
    return el("li", { class: "lesson-card" }, [link]);
  }

  function lockedCard(item) {
    var title = el("h3", { class: "lesson-title" });
    title.appendChild(document.createTextNode(item.title));
    title.appendChild(el("span", { class: "tag", text: "Not written yet" }));
    return el("li", { class: "lesson-card is-locked" }, [
      el("div", {}, [
        el("span", { class: "lesson-index", text: pad(item.id) }),
        el("div", {}, [
          title,
          el("p", { class: "lesson-summary", text: item.summary })
        ])
      ])
    ]);
  }

  function mount() {
    var lessons = window.LESSONS || [];
    var upcoming = window.UPCOMING || [];
    var list = document.getElementById("lesson-list");
    if (!list) return;

    lessons.forEach(function (lesson) { list.appendChild(lessonCard(lesson)); });
    upcoming.forEach(function (item) { list.appendChild(lockedCard(item)); });

    /* Continue where you left off: only if there is something to continue. */
    var slot = document.getElementById("continue-slot");
    var last = Progress.lastVisited();
    var lesson = last ? window.PPC.lessonById(last.id) : null;
    if (!lesson) {
      /* fall back to any lesson that has been started */
      for (var i = 0; i < lessons.length; i++) {
        if (Progress.summary(lessons[i]).started) { lesson = lessons[i]; break; }
      }
    }
    if (slot && lesson && Progress.summary(lesson).started) {
      var btn = el("a", {
        class: "btn btn-primary",
        href: "lesson.html?id=" + encodeURIComponent(lesson.id)
      }, ["Continue lesson " + lesson.id, icon("arrow")]);
      slot.appendChild(btn);
    }
  }

  document.addEventListener("DOMContentLoaded", mount);
})();
