---
id: second-commit
type: git
title: Change, look, commit
tasks:
  - id: setup
    prompt: "This step starts a fresh copy of the project. Run `git init`, `git add .` and commit it with a sensible message."
    check: [{ kind: commits, min: 1 }]
  - id: edit
    prompt: "In `jobs.py`, add a job to the list: `(\"Fix the gate\", 1),`. Then run `git diff`."
    check: [{ kind: file-contains, file: jobs.py, text: "Fix the gate" }]
    feedback: "Lines starting with `+` were added and lines with `-` were removed. That's the difference between your folder and the last staged version."
  - id: commit-again
    prompt: "Stage and commit the change. Write a message that finishes the sentence \"This commit will...\", like `git commit -m \"Add the gate repair\"`."
    check: [{ kind: commits, min: 2 }, { kind: file-contains, file: jobs.py, text: "Fix the gate", committed: true }, { kind: clean }]
    feedback: "Two photographs. `git log --oneline` shows them newest first."
---
`git diff` shows exactly what you've changed since the last commit: lines starting `+` were added, and lines starting `-` were taken out. Read it before every commit. Paul does, every time.
