---
id: predict-sigmoid
type: predict
title: Score, then squash
concept: logistic-regression
code: |
  import numpy as np


  def sigmoid(z):
      return 1 / (1 + np.exp(-z))


  X = np.array([[3.0], [10.0]])
  w = np.array([2.0])
  b = -6.0
  print(np.round(sigmoid(X @ w + b), 2))
question: What does this print?
options:
  - text: "[0.5 1. ]"
    correct: true
    feedback: "Right. The scores are 0 and 14. The sigmoid of 0 is exactly 0.5, and 14 is so far up the slide that it rounds to 1."
  - text: "[0. 1.]"
    misconception: sigmoid-of-zero-is-zero
    feedback: "The first score is 0, and the sigmoid of 0 is 0.5, the middle of the slide. A chance of 0 would need a hugely negative score."
  - text: "[0 1]"
    misconception: logistic-outputs-class
    feedback: "Logistic regression gives chances, not answers. The sigmoid of 0 is 0.5, and the sigmoid of 14 rounds to 1.0, a float."
---
Two respondents, one reading each. Work out each score, `X @ w + b`, first.
