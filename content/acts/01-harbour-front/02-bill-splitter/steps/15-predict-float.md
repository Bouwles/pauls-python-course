---
id: predict-float
type: predict
title: Seven twenty, nearly
concept: float-conversion
code: |
  drink = 2.40
  print(drink * 3)
question: What does this print?
options:
  - text: "7.2"
    misconception: float-is-exact
    feedback: "That's the answer on paper. But 2.40 can't be stored exactly in binary, and the tiny difference shows once you multiply."
  - text: "7.20"
    misconception: float-is-exact
    feedback: "Python doesn't know this is money, so it never adds a zero to make two places. And 2.40 can't be stored exactly, so the answer is a hair off anyway."
  - text: "7.199999999999999"
    correct: true
    feedback: "Right, and nobody believes it the first time. 2.40 is stored a tiny bit wrong, and multiplying by 3 makes the difference big enough to show."
---
Three drinks at 2.40 each. Caitlin would say seven twenty. Remember what the last step said about floats.
