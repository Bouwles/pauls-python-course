---
id: predict
type: predict
title: Which job
concept: indexing
code: |
  tasks = ["rocket poster", "album cover", "order ink", "frame the prints"]
  print(tasks[1])
question: What does this print?
options:
  - text: rocket poster
    misconception: index-from-one
    feedback: "Python counts from 0. `tasks[0]` is the rocket poster, so `tasks[1]` is the next one along: the album cover."
  - text: album cover
    correct: true
    feedback: "Index 0 is the poster, so index 1, one step along, is the album cover."
  - text: "['album cover']"
    misconception: index-gives-list
    feedback: "Square brackets after a list's name pick out one item. You get the text itself, not a list with it inside."
---
Riya's jobs for Tuesday are a list. This picks out one of them.
