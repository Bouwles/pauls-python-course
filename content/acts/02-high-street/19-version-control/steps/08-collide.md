---
id: collide
type: git
title: When two changes collide
dialogue:
  - neil.thinking: "Paul wants eight pounds extra for urgent jobs. I think six. We'll see who git believes."
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
Both branches will change the same line. Git can't choose, so it will ask you to.
