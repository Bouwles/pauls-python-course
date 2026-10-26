---
id: predict-float
type: predict
title: Seven twenty, nearly
concept: float-conversion
code: |
  loaf = 2.40
  print(loaf * 3)
question: What does this print?
options:
  - text: "7.2"
    misconception: float-is-exact
    feedback: "That's what it should be. But 2.40 is stored in binary, which can't hold it exactly, and the tiny error shows once you multiply."
  - text: "7.20"
    misconception: float-is-exact
    feedback: "Python doesn't know this is money, so it never adds a zero to make two places. And the answer isn't quite 7.2 anyway: 2.40 can't be stored exactly."
  - text: "7.199999999999999"
    correct: true
    feedback: "Right, and nobody believes it the first time. Floats are stored in binary, 2.40 can't be held exactly, so three loaves come to a hair under 7.2."
after: |
  Run it. Then try `print(0.1 + 0.2)` for the most famous one.
---
A number with a decimal point is a **float**. Three loaves at 2.40 each. Bea would say seven twenty.

What does Python say?
