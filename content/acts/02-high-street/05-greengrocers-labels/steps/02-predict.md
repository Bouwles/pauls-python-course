---
id: predict-two-ifs
type: predict
title: Two places for an if
concept: conditional-comprehensions
code: |
  stock = [30, 8, 0, 12]
  in_shop = [count for count in stock if count > 0]
  marked = [count if count > 0 else "out" for count in stock]
  print(len(in_shop), len(marked))
question: What does this print?
options:
  - text: "3 4"
    correct: true
    feedback: "Right. The `if` at the end is a filter: the 0 is left out. The `if ... else` at the front keeps every item and chooses what to write for each."
  - text: "4 4"
    misconception: end-if-keeps-all
    feedback: "An `if` at the end decides which items get in at all. The 0 fails it, so `in_shop` has three."
  - text: "3 3"
    misconception: front-if-filters
    feedback: "An `if ... else` at the front doesn't remove anything. It picks what to put in for every item, so `marked` keeps all four."
---
An `if` can go in two places in a comprehension, and the two places do different jobs.

Sanjay's counts for apples, pears, leeks and plums. Work out how long each new list is.
