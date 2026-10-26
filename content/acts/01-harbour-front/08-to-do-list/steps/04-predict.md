---
id: predict-remove
type: predict
title: Taking one off
concept: list-methods
code: |
  tasks = ["post", "stamps", "post", "sweep"]
  tasks.remove("post")
  print(tasks)
question: What does this print?
options:
  - text: "['stamps', 'post', 'sweep']"
    correct: true
    feedback: "Right. `.remove()` finds the first `\"post\"`, takes it off and stops looking."
  - text: "['stamps', 'sweep']"
    misconception: remove-deletes-every-match
    feedback: "`.remove()` takes off one item: the first match. The second `\"post\"` stays on the list."
  - text: "['post', 'stamps', 'sweep']"
    misconception: remove-takes-last-match
    feedback: "It searches from the front, so the first `\"post\"` goes. The later one moves up a place."
  - text: An error
    misconception: remove-takes-index
    error: TypeError
    feedback: "`.remove()` takes the value to look for, not a position. `.pop()` is the one that takes a position."
after: |
  Run it. Then put `"parcels"` in place of `"post"` on line 2 and run it again.
---
`.remove()` is another list method. Like `.append()`, it belongs to the list, you call it with a dot, and it changes the list itself. It takes a value, not an index.

Mira wrote `post` down twice. Decide what one `.remove()` does.
