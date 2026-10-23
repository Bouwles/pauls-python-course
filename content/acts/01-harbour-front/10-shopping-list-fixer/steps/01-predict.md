---
id: predict-remove
type: predict
title: Taking one out
concept: list-methods
code: |
  shopping = ["flour", "eggs", "flour", "salt"]
  shopping.remove("flour")
  print(shopping)
question: What does this print?
options:
  - text: "['eggs', 'flour', 'salt']"
    correct: true
    feedback: "Right. `.remove()` finds the first `\"flour\"`, takes it out and stops looking."
  - text: "['eggs', 'salt']"
    misconception: remove-deletes-every-match
    feedback: "`.remove()` takes out one item: the first match. The second `\"flour\"` stays on the list."
  - text: "['flour', 'eggs', 'salt']"
    misconception: remove-takes-last-match
    feedback: "It searches from the front, so the first `\"flour\"` goes. The later one moves up a place."
  - text: An error
    misconception: remove-takes-index
    error: TypeError
    feedback: "`.remove()` takes the value to look for, not a position. `.pop()` is the one that takes a position."
after: |
  Run it. Then put `"salt"` in place of `"flour"` on line 2 and run it again.
---
`.remove()` is a list method, like `.append()` from Mira's pigeonholes. It belongs to the list, you call it with a dot, and it changes the list itself.

Bea's list has flour on it twice. Decide what one `.remove()` does.
