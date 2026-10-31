---
id: predict-comprehension
type: predict
title: A list in one line
concept: list-comprehensions
code: |
  scores = [4, 6, 8]
  doubled = [score * 2 for score in scores]
  print(doubled)
question: What does this print?
options:
  - text: "[8, 12, 16]"
    correct: true
    feedback: "Right. The comprehension works out `score * 2` for each score and collects every answer in a new list."
  - text: "16"
    misconception: comprehension-keeps-last
    feedback: "A comprehension collects a value for every item. It doesn't stop at the last one, the way a loop variable does."
  - text: "[4, 6, 8, 4, 6, 8]"
    misconception: comprehension-applies-to-list
    feedback: "`score * 2` is worked out for each score on its own. Doubling the whole list would be `scores * 2`."
---
Square brackets with a `for` inside build a new list in one line. This is called a **list comprehension**. Read it as: *score times two, for each score in scores*.

Caitlin's joker round counts double. Lock in your answer, then run it.
