---
id: what-git-is
type: reading
title: Photographs, not drawers
dialogue:
  - moss: "A commit is a photograph of every file, with a note on the back."
---
**git** keeps the history of a folder of files. It works in three places:

- the **working folder**, where you edit files as normal;
- the **staging area**, where you put the changes you want in the next photograph (`git add`);
- the **history**, a chain of **commits**, each a photograph of every staged file plus a message saying what changed and why (`git commit`).

Nothing goes into history by accident. You choose what to stage, and you write the note. `git status` tells you what's where, and `git log` shows the chain.

In the terminal below the editor you can type real git commands. The project is the workshop's job tracker.
