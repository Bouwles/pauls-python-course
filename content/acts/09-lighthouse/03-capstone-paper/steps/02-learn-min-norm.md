---
id: learn-min-norm
type: learn
title: The smallest fit
concept: double-descent
code: |
  import numpy as np

  # One example, two weights: 3a + 4b = 5. Endless pairs fit it exactly.
  F = np.array([[3.0, 4.0]])
  y = np.array([5.0])

  for weights in [np.array([1.0, 0.5]), np.array([-1.0, 2.0])]:
      print(weights, F @ weights, round(float(np.linalg.norm(weights)), 2))

  smallest = np.linalg.pinv(F) @ y
  print(smallest, F @ smallest, round(float(np.linalg.norm(smallest)), 2))
---
With more weights than examples, many sets of weights fit every example exactly. Which one should the fit choose? The paper's answer: the smallest, the **minimum-norm** fit. A set of weights' **norm** is its size: the square root of the sum of its squares, `np.linalg.norm`.

`np.linalg.pinv`, the **pseudo-inverse**, finds it. With fewer weights than examples it gives ordinary least squares, the best fit, as in the Model Room. With more, it gives the exact fit with the smallest norm.

The code has one training example and two weights. Two different pairs both give 5, with norms `1.12` and `2.24`. The pseudo-inverse picks `[0.6 0.8]`, norm `1.0`.

The usual mistake is solving the normal equations, `(F.T @ F) w = F.T @ y`. Past the threshold `F.T @ F` has no inverse.
