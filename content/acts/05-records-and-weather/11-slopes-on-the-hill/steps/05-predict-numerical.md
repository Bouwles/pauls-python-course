---
id: predict-numerical
type: predict
title: Two steps apart
concept: numerical-gradients
code: |
  def f(x):
      return x ** 3


  step = 0.01
  print(round((f(2 + step) - f(2 - step)) / step, 2))
question: "The slope of `x ** 3` at 2 is 12. What does this print?"
options:
  - text: "24.0"
    correct: true
    feedback: "Right. The two points are `2 * step` apart, but the code divides by `step`, so the answer is twice the true slope."
  - text: "12.0"
    misconception: step-either-side-is-one-step
    feedback: "From `2 - step` to `2 + step` is two steps, not one. Dividing by one step doubles the slope."
  - text: "0.24"
    misconception: slope-is-rise
    feedback: "0.24 is the rise between the two points. Dividing by the run, here `step`, turns it into a slope."
---
A step either side, measured on `x ** 3`.
