---
id: learn-layers
type: learn
title: A layer of neurons
concept: neural-networks
code: |
  import numpy as np

  evenings = np.array([[0.9, 0.2, 0.5, 1.0],
                       [0.1, 0.7, 0.8, 1.0],
                       [0.5, 0.5, 0.5, 0.0]])     # 3 evenings, 4 readings each
  W = np.ones((4, 2)) * 0.5                       # 4 readings in, 2 neurons
  b = np.array([0.0, -1.0])                       # one bias per neuron

  layer = evenings @ W + b
  print(evenings.shape, W.shape, layer.shape)
  print(layer)
---
One straight line isn't enough, so put several neurons side by side: a **layer**. Each has its own weights and bias.

`X @ W + b` works out every neuron for every example at once. `X` has one row per evening. `W` has one **column** per neuron, holding that neuron's weights. `b` has one bias per neuron, added to every row. The answer has a row per evening and a column per neuron.

A **neural network** is layers in a row: each layer's answers are the next layer's readings.

The shapes must line up: `(n, k) @ (k, m)` gives `(n, m)`, and the inner sizes must match. In the example, `(3, 4) @ (4, 2)` gives `(3, 2)`.

The usual mistake is writing `W` the other way round, one row per neuron.
