---
id: predict-columns
type: predict
title: Two students, two weights
concept: multivariate-regression
code: |
  import numpy as np

  X = np.array([[10.0, 2.0],
                [14.0, 6.0]])
  w = np.array([1.0, -0.5])
  b = 2.0
  print(X @ w + b)
question: What does this print?
options:
  - text: "[11. 13.]"
    correct: true
    feedback: "Right. Row one: 10 times 1, plus 2 times -0.5, plus 2, is 11. Row two: 14 minus 3 plus 2 is 13. One guess per row."
  - text: "[ 9. 11.]"
    misconception: intercept-only-at-zero
    feedback: "That's `X @ w` without `b`. The `+ b` adds 2 to every row's guess."
  - text: |-
      [[12.  1.]
       [16. -1.]]
    misconception: matmul-is-elementwise
    feedback: "That's `X * w + b`, which multiplies number by number and keeps the table. `@` multiplies each row by the weights and adds them up, so each row becomes one number."
---
Each row is a student. Work out each row's guess: each column times its weight, added up, plus `b`.
