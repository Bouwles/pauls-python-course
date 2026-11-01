---
id: worked
type: worked
title: How Paul would try an idea
language: text
dialogue:
  - paul.neutral: "An idea goes on a branch. If it's good, it comes home. If not, nothing's lost."
code: |
  workshop $ git switch -c urgent
  Switched to a new branch 'urgent'
  workshop $ git add jobs.py
  workshop $ git commit -m "Mark urgent jobs with a star"
  [urgent 8b0d4e2] Mark urgent jobs with a star
  workshop $ git switch main
  Switched to branch 'main'
  workshop $ git merge urgent
  Updating c41a9e7..8b0d4e2
  Fast-forward
subgoals:
  - label: Make a branch for the idea and move onto it
    lines: [1, 2]
  - label: Do the work and commit it on the branch
    lines: [3, 5]
  - label: Go back to main
    lines: [6, 7]
  - label: Bring the idea home
    lines: [8, 10]
explain:
  prompt: "Why did the merge say Fast-forward?"
  answer: "Nothing changed on main while Paul was on the branch, so git just moved main forward to the branch's commit. No new merge commit was needed."
  concept: git-branches
---
A **branch** is a name pointing at a commit. `git switch -c name` makes a new one and moves you onto it; commits you make there move that name forward and leave `main` alone.
