---
id: branch
type: git
title: An idea on a branch
tasks:
  - id: setup
    prompt: "Fresh project again: `git init`, `git add .`, and a first commit."
    check: [{ kind: commits, min: 1 }]
  - id: make-branch
    prompt: "Make a branch called `urgent` and switch to it: `git switch -c urgent`."
    check: [{ kind: on-branch, name: urgent }]
  - id: work
    prompt: "On the branch, change the print line in `jobs.py` to put a star by urgent jobs, for example `print(\"*\" if urgency == 1 else \" \", urgency, name)`. Commit it."
    check: [{ kind: commits, min: 2, branch: urgent }, { kind: file-contains, file: jobs.py, text: "*", committed: true }]
  - id: home
    prompt: "Switch back to `main`. Look at `jobs.py`: the star has gone, because main hasn't heard of it. Now `git merge urgent`."
    check: [{ kind: on-branch, name: main }, { kind: merged, branch: urgent }]
    feedback: "Fast-forward: main simply moved up to the branch's commit."
---
Branches cost nothing. Make one for every idea you're not sure about.
