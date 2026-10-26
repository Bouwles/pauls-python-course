---
id: predict
type: predict
title: Which job
concept: indexing
code: |
  tasks = ["sort the post", "mend the scales", "order stamps", "sweep up"]
  print(tasks[1])
question: What does this print?
options:
  - text: sort the post
    misconception: index-from-one
    feedback: "Python counts from 0. `tasks[0]` is sorting the post, so `tasks[1]` is the next one along: mending the scales."
  - text: mend the scales
    correct: true
    feedback: "Right. Index 0 is the post, index 1 is the scales."
  - text: "['mend the scales']"
    misconception: index-gives-list
    feedback: "Square brackets after a list's name pick out one item. You get the text itself, not a list with it inside."
after: |
  Run it.
---
A **list** keeps several values in order, between square brackets, separated by commas. Mira's jobs for Tuesday are a list.

`tasks[1]` picks out one item by its index.
