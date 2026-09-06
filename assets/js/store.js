/* Theme, progress and a few DOM helpers. No dependencies. */
(function () {
  "use strict";

  var PROGRESS_KEY = "ppc:progress:v1";
  var THEME_KEY = "ppc:theme:v1";

  /* --- storage (never throw: private mode, blocked cookies, etc.) --- */

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* no storage, carry on */ }
  }

  /* --- progress ---------------------------------------------------- */

  function all() {
    var data = read(PROGRESS_KEY, {});
    return (data && typeof data === "object") ? data : {};
  }

  function forLesson(id) {
    var entry = all()[String(id)];
    return {
      sections: (entry && entry.sections) || [],
      practice: (entry && entry.practice) || [],
      quiz: !!(entry && entry.quiz)
    };
  }

  function save(id, entry) {
    var data = all();
    data[String(id)] = entry;
    write(PROGRESS_KEY, data);
  }

  function addTo(id, bucket, value) {
    var entry = forLesson(id);
    if (entry[bucket].indexOf(value) === -1) {
      entry[bucket] = entry[bucket].concat([value]);
      save(id, entry);
      return true;
    }
    return false;
  }

  var Progress = {
    get: forLesson,

    markSectionRead: function (id, key) { return addTo(id, "sections", String(key)); },
    markPracticeDone: function (id, key) { return addTo(id, "practice", String(key)); },
    markQuizDone: function (id) {
      var entry = forLesson(id);
      if (!entry.quiz) { entry.quiz = true; save(id, entry); }
    },

    /* one number per lesson card: everything there is to do, and how much is done */
    summary: function (lesson) {
      var entry = forLesson(lesson.id);
      var total = lesson.sections.length + lesson.practice.length + (lesson.quiz.length ? 1 : 0);
      var done = 0;
      lesson.sections.forEach(function (_, i) {
        if (entry.sections.indexOf(String(i)) !== -1) done++;
      });
      lesson.practice.forEach(function (task) {
        if (entry.practice.indexOf(String(task.id)) !== -1) done++;
      });
      if (lesson.quiz.length && entry.quiz) done++;
      return { done: done, total: total, started: done > 0 };
    },

    lastVisited: function () { return all()._last || null; },
    setLastVisited: function (id) {
      var data = all();
      data._last = { id: id };
      write(PROGRESS_KEY, data);
    },

    reset: function () {
      try { localStorage.removeItem(PROGRESS_KEY); } catch (e) { /* nothing to clear */ }
    }
  };

  /* --- theme -------------------------------------------------------- */

  var Theme = {
    stored: function () { return read(THEME_KEY, null); },
    apply: function (value) {
      if (value === "light" || value === "dark") {
        document.documentElement.setAttribute("data-theme", value);
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    },
    current: function () {
      var set = document.documentElement.getAttribute("data-theme");
      if (set) return set;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    },
    toggle: function () {
      var next = Theme.current() === "dark" ? "light" : "dark";
      Theme.apply(next);
      write(THEME_KEY, next);
      return next;
    },
    init: function () { Theme.apply(Theme.stored()); }
  };

  /* --- tiny DOM helpers --------------------------------------------- */

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (child) {
      if (child === null || child === undefined) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  var ICONS = {
    play: '<path d="M5 3.5 13 8l-8 4.5z"/>',
    copy: '<rect x="5.5" y="5.5" width="8" height="8" rx="1"/><path d="M10.5 3.5h-7a1 1 0 0 0-1 1v7"/>',
    check: '<path d="M3 8.5 6.5 12 13 4.5"/>',
    cross: '<path d="M4 4l8 8M12 4l-8 8"/>',
    chevron: '<path d="M4 6.5 8 10.5l4-4"/>',
    sun: '<circle cx="8" cy="8" r="3.1"/><path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2 3.1 3.1"/>',
    moon: '<path d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.8 5.8 0 1 0 7.1 7.1z"/>',
    lock: '<rect x="3.5" y="7" width="9" height="6.5" rx="1"/><path d="M5.75 7V5.25a2.25 2.25 0 0 1 4.5 0V7"/>',
    arrow: '<path d="M2.5 8h11M9.5 4l4 4-4 4"/>'
  };

  function icon(name, extraClass) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("class", "icon" + (extraClass ? " " + extraClass : ""));
    svg.innerHTML = ICONS[name] || "";
    return svg;
  }

  /* --- shared chrome -------------------------------------------------- */

  function mountThemeToggle() {
    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    function paint() {
      var dark = Theme.current() === "dark";
      btn.innerHTML = "";
      btn.appendChild(icon(dark ? "sun" : "moon"));
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("title", dark ? "Light theme" : "Dark theme");
    }
    paint();
    btn.addEventListener("click", function () { Theme.toggle(); paint(); });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paint);
  }

  function mountResetProgress() {
    var btn = document.querySelector("[data-reset-progress]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (window.confirm("Clear everything this browser has saved about your progress? This cannot be undone.")) {
        Progress.reset();
        window.location.reload();
      }
    });
  }

  function lessonById(id) {
    var list = window.LESSONS || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(id)) return list[i];
    }
    return null;
  }

  Theme.init();

  document.addEventListener("DOMContentLoaded", function () {
    mountThemeToggle();
    mountResetProgress();
  });

  window.PPC = {
    Progress: Progress,
    Theme: Theme,
    el: el,
    icon: icon,
    lessonById: lessonById
  };
})();
