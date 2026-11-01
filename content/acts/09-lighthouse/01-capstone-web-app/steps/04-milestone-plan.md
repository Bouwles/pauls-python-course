---
id: plan-and-routes
type: milestone
title: "Milestone 1: the plan and the routes"
test_plan: true
evidence: none
dialogue:
  - paul.thinking: "Before any code: what it does, what it says when it can't, and how you'll know."
  - caitlin.pleased: "I'd start with the pages. People like pages."
  - aaesha.unimpressed: "They like a berth that's really theirs even more. Routes first."
checklist:
  - id: starts
    text: "The skeleton starts with one command, and you've written that command down."
    why: "If the marina can't start it, they can't use it. One command, written down, from today."
  - id: routes
    text: "Every agreed route is in your plan with its method, its path, what it takes and what it gives back."
    why: "Writing it in your own words is how you find the parts of the brief you only thought you'd understood."
  - id: failures
    text: "Every way each route can fail is listed, with the status it gets: 400, 404 or 409."
    why: "Most of what a web app does is answer wrong requests. Plan for them now, while it's cheap."
  - id: pages
    text: "You've sketched two pages: what the berth master sees at the desk, and what a skipper sees on the pontoon."
    why: "Caitlin can read JSON. The skipper of the Kittiwake, in oilskins, in the rain, can't."
  - id: plan
    text: "Your test plan has at least three tests the agreed suite doesn't already have."
    why: "The agreed tests are the marina's. Yours are for the things only you know might break."
  - id: venv
    text: "The project has its own virtual environment, with Flask installed from requirements.txt."
    why: "Your Flask and the next project's Flask shouldn't have to agree with each other."
  - id: git
    text: "The project is in a git repository with a first commit."
    why: "From here on, every change can be undone. That is worth more than it sounds."
---
Plan first. Read `BRIEF.md` and `tests/test_api.py` side by side: the tests are the brief, made exact. Knowing what's already checked tells you what isn't.

Write each route in your own words: method, path, what it takes, what it gives back, and every way it can go wrong. Then the pages, on paper: what the berth master needs at the desk, and what a skipper needs on a wet pontoon.

Your test plan is for what the agreed suite leaves out. A missing data file on the first run, a boat booked from the page rather than the API, a date that's nonsense in `?date=`: each is a line in the plan, with what you expect to see.
