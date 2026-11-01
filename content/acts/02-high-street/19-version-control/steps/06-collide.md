---
id: collide
type: git
title: When two changes collide
dialogue:
  - paul.thinking.think: "Two people, one line. Git won't guess who's right. That's your job."
tasks:
  - id: setup
    prompt: "Fresh project: `git init`, `git add .`, first commit."
    check: [{ kind: commits, min: 1 }]
  - id: branch-change
    prompt: "Make a branch `prices` and switch to it. In `prices.py`, change `URGENT_EXTRA = 5` to `URGENT_EXTRA = 8`. Commit."
    check: [{ kind: branch-exists, name: prices }, { kind: commits, min: 2, branch: prices }]
  - id: main-change
    prompt: "Switch back to `main`. Change the same line to `URGENT_EXTRA = 6` (Neil thinks 8 is too much). Commit that too."
    check: [{ kind: on-branch, name: main }, { kind: commits, min: 2, branch: main }]
  - id: merge
    prompt: "Now `git merge prices`. Read what git says, then open `prices.py`."
    check: [{ kind: merge-commit }]
    feedback: "The lines between `<<<<<<<` and `=======` are main's version; between `=======` and `>>>>>>>` are the branch's."
  - id: resolve
    prompt: "Edit `prices.py` so it holds the value you decide on, with the `<<<<<<<`, `=======` and `>>>>>>>` lines gone. Then `git add prices.py` and `git commit -m \"Settle the urgent price\"`."
    check: [{ kind: merge-commit }, { kind: no-conflict-markers }, { kind: merged, branch: prices }, { kind: clean }]
    feedback: "A merge commit has two parents: the history remembers both lines of work, and how you settled them."
---
A **conflict** happens when both branches changed the same lines since they split. Git marks the clash inside the file and waits for you to choose.

If it gets tangled, `git merge --abort` puts things back as they were before the merge.
