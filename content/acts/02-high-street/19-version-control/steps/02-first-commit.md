---
id: first-commit
type: git
title: The first photograph
dialogue:
  - caitlin.confused: "I committed everything with the message 'stuff'. Is that bad?"
  - paul.unimpressed: "Yes."
tasks:
  - id: init
    prompt: "Make the folder a repository: `git init`. Then try `git status`."
    check: [{ kind: initialised }]
    feedback: "Every file shows as untracked: git can see them but isn't keeping them yet."
  - id: stage
    prompt: "Stage everything with `git add .` and run `git status` again."
    check: [{ kind: initialised }]
    feedback: "Now they're under \"Changes to be committed\": staged, ready for the photograph."
  - id: commit
    prompt: "Commit with a message that says what this is: `git commit -m \"First version of the job tracker\"`."
    check: [{ kind: commits, min: 1 }, { kind: clean }]
    feedback: "One commit. `git log` shows it, with its id, its message and which branch points at it."
---
Work through the tasks in order. They tick off as the repository changes.
