---
id: predict-remove
type: predict
title: Taking one off
concept: list-methods
code: |
  tasks = ["chalk", "quizzes", "chalk", "board"]
  tasks.remove("chalk")
  print(tasks)
question: What does this print?
options:
  - text: "['quizzes', 'chalk', 'board']"
    correct: true
    feedback: "Right. `.remove()` finds the first `\"chalk\"`, takes it off and stops looking."
  - text: "['quizzes', 'board']"
    misconception: remove-deletes-every-match
    feedback: "`.remove()` takes off one item: the first match. The second `\"chalk\"` stays on the list."
  - text: "['chalk', 'quizzes', 'board']"
    misconception: remove-takes-last-match
    feedback: "It searches from the front, so the first `\"chalk\"` goes. The later one moves up a place."
  - text: An error
    misconception: remove-takes-index
    error: TypeError
    feedback: "`.remove()` takes the value to look for, not a position. `.pop()` is the one that takes a position."
after: |
  Run it. Then put `"pens"` in place of `"chalk"` on line 2 and run it again.
---
`.remove()` is another list method. Like `.append()`, it belongs to the list, you call it with a dot, and it changes the list itself. It takes a value, not an index.

Neil wrote `chalk` down twice. Decide what one `.remove()` does.
