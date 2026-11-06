---
id: predict-remove
type: predict
title: Taking one off
concept: list-methods
code: |
  tasks = ["ink", "posters", "ink", "frames"]
  tasks.remove("ink")
  print(tasks)
question: What does this print?
options:
  - text: "['posters', 'ink', 'frames']"
    correct: true
    feedback: "`.remove()` finds the first `\"ink\"`, takes it off and stops looking. The second one moves up to index 1."
  - text: "['posters', 'frames']"
    misconception: remove-deletes-every-match
    feedback: "`.remove()` takes off one item: the first match. The second `\"ink\"` stays on the list."
  - text: "['ink', 'posters', 'frames']"
    misconception: remove-takes-last-match
    feedback: "It searches from the front, so the first `\"ink\"` goes. The later one moves up a place."
  - text: An error
    misconception: remove-takes-index
    error: TypeError
    feedback: "`.remove()` takes the value to look for, not a position. `.pop()` is the one that takes a position."
---
Riya wrote `ink` down twice.
