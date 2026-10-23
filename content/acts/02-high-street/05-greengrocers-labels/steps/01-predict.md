---
id: predict-comprehension
type: predict
title: A list in one line
concept: list-comprehensions
code: |
  prices = [45, 60, 80]
  doubled = [price * 2 for price in prices]
  print(doubled)
question: What does this print?
options:
  - text: "[90, 120, 160]"
    correct: true
    feedback: "Right. The comprehension works out `price * 2` for each price and collects every answer in a new list."
  - text: "160"
    misconception: comprehension-keeps-last
    feedback: "A comprehension collects a value for every item. It doesn't stop at the last one, the way a loop variable does."
  - text: "[45, 60, 80, 45, 60, 80]"
    misconception: comprehension-applies-to-list
    feedback: "`price * 2` is worked out for each price on its own. Doubling the whole list would be `prices * 2`."
---
Square brackets with a `for` inside build a new list in one line. This is called a **list comprehension**. Read it as: *price times two, for each price in prices*.

Commit to an answer, then run it.
