---
id: predict
type: predict
title: Which job
concept: indexing
code: |
  tasks = ["mark the quizzes", "fix the projector", "order chalk", "wipe the board"]
  print(tasks[1])
question: What does this print?
options:
  - text: mark the quizzes
    misconception: index-from-one
    feedback: "Python counts from 0. `tasks[0]` is marking the quizzes, so `tasks[1]` is the next one along: fixing the projector."
  - text: fix the projector
    correct: true
    feedback: "Right. Index 0 is the quizzes, index 1 is the projector."
  - text: "['fix the projector']"
    misconception: index-gives-list
    feedback: "Square brackets after a list's name pick out one item. You get the text itself, not a list with it inside."
after: |
  Run it.
---
A **list** keeps several values in order, between square brackets, separated by commas. Neil's jobs for Tuesday are a list.

`tasks[1]` picks out one item by its index.
