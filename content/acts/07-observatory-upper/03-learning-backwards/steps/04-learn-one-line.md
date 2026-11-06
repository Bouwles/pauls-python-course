---
id: learn-one-line
type: learn
title: One neuron, one straight line
concept: perceptron
code: |
  import numpy as np

  # Both switches up? An AND: on only at (1, 1). One straight line can split that.
  settings = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
  light_on = [0, 0, 0, 1]

  weights, bias = np.zeros(2), 0.0
  for epoch in range(20):
      for setting, label in zip(settings, light_on):
          error = label - (1 if np.dot(weights, setting) + bias > 0 else 0)
          weights = weights + 0.1 * error * setting
          bias = bias + 0.1 * error

  print([1 if np.dot(weights, s) + bias > 0 else 0 for s in settings])
---
Plot two readings on a square, one along the bottom and one up the side. Where the total `weights` times readings plus bias is exactly 0 is a straight line across the square. Above it, the neuron says 1; below it, 0. So one neuron can learn any rule a single straight line can split, and no other.

The example's rule is "on only when both switches are up". The one corner where it's on can be cut off from the other three by a straight line, so after 20 **epochs**, passes through all four examples, it gets every one right: `[0, 0, 0, 1]`.

The usual mistake is thinking one neuron can learn anything, given long enough. If no straight line splits the answers, it never will. Some rules need two lines.
