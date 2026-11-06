---
id: learn-lstsq
type: learn
title: The exact answer, for checking
concept: multivariate-regression
code: |
  import numpy as np

  x = np.array([1.0, 2.0, 3.0])
  y = np.array([3.0, 5.0, 7.0])       # exactly on y = 2x + 1

  with_ones = np.column_stack([x, np.ones(len(x))])
  print(with_ones)
  solution = np.linalg.lstsq(with_ones, y, rcond=None)[0]
  print(solution.round(3))
---
For a straight-line model there's an exact answer, so you can check your walk against it. `np.linalg.lstsq` finds the weights with the smallest mean squared error, for any number of columns. Its name is short for least squares.

It has no `b` of its own. So you add a column of ones to the table, with `np.column_stack`, and the weight it finds for that column is `b`. `[0]` picks the weights out of what it hands back, with `b` last. The example prints the table, then `[2. 1.]`: `w` is 2 and `b` is 1.

Bigger models have no exact answer, which is why they walk downhill. Here you'll do both, and they must agree.

The usual mistake is forgetting the ones. Without them, the line has to pass through zero.
