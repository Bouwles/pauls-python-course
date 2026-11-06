---
id: learn-overfitting
type: learn
title: Learning by heart
concept: overfitting
code: |
  import numpy as np

  x = np.array([0.0, 1.0, 2.0, 3.0])
  y = np.array([1.0, 2.6, 2.4, 4.0])     # roughly a line, plus some wobble
  new_x, new_y = 4.0, 5.0                # one more reading, kept back

  for degree in [1, 3]:
      table = np.column_stack([x ** power for power in range(degree + 1)])
      weights = np.linalg.lstsq(table, y, rcond=None)[0]
      train_error = np.mean((table @ weights - y) ** 2)
      new_row = np.array([new_x ** power for power in range(degree + 1)])
      print(degree, round(train_error, 2), round(new_row @ weights, 1))
---
**Overfitting** is memorising the answers instead of learning the rule, like a student who learns last year's paper by heart: perfect on that paper, lost on a new one.

A model with as many weights as readings can pass through every reading exactly, wobbles and all, and swing wildly between them. The example fits four readings, then tries a fifth it kept back, where the answer is 5.0. Degree 3 has a training error of `0.0`, and guesses `11.0`. The straight line misses the four by a little, and guesses `4.7`.

The opposite is **underfitting**: a model too simple to follow the rule at all, bad on every reading.

The usual mistake is trusting a low training error. Only readings the model never saw can show it learnt the rule.
