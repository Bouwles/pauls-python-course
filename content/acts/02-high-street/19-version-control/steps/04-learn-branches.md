---
id: learn-branches
type: learn
title: A line of work of its own
concept: git-branches
dialogue:
  - paul.neutral: "An idea goes on a branch. If it's good, it comes home. If not, nothing's lost."
---
A **branch** is a name pointing at a commit. Every repository starts with one, `main`.

It lets you try an idea without touching the version that works.

`git switch -c urgent` makes a new branch called `urgent` and moves you onto it. Commits you make there move `urgent` forward and leave `main` where it was. `git switch main` goes back. `git merge urgent`, run on `main`, brings the branch's commits into `main`.

If nothing happened on `main` meanwhile, git just moves `main` up to the branch's last commit: a **fast-forward**.

The usual slip is to merge the wrong way round. Switch to the branch you want the work in, then merge the other one into it.
