---
id: what-git-is
type: learn
title: Photographs, not drawers
concept: git-basics
dialogue:
  - paul.neutral.point: "A commit is a photograph of every file, with a note on the back."
---
**git** is a program that keeps the history of a folder of files. Every saved version is a **commit**: a photograph of the files, with a message saying what changed and why.

No more `final2`. Any earlier version can be looked at, or brought back.

Nothing goes into the history by accident. You edit files as normal, then `git add` puts the changes you want into the **staging area**, ready for the next photograph. `git commit -m "Add the gate repair"` takes it. `git status` says what's changed and what's staged, and `git log` shows the history, newest first.

The usual slip is to think editing a file saves it in the history. Only a commit does.
