---
id: predict-chain
type: predict
title: Inside and out
concept: chain-rule
code: |
  def f(x):
      return (2 * x - 5) ** 2


  step = 1e-5
  x = 1.0
  print(round((f(x + step) - f(x - step)) / (2 * step), 3))
question: "This measures the slope of `(2 * x - 5) ** 2` at 1. Work it out with the chain rule first. What does it print?"
options:
  - text: "-12.0"
    correct: true
    feedback: "Right. The inner value is 2 - 5, which is -3. The outer slope there is 2 times -3, and the inner part changes 2 for each 1: -6 times 2 is -12."
  - text: "4.0"
    misconception: outer-slope-at-x
    feedback: "That takes the outer slope at `x`, 2 times 1, instead of at the inner value, -3. The squaring is done to `2 * x - 5`, not to `x`."
  - text: "-6.0"
    misconception: chain-forgets-inner
    feedback: "-6 is the outer slope alone. The inner part, `2 * x - 5`, changes 2 for every 1 that `x` does, so multiply by 2."
---
The measured answer should agree with yours.
