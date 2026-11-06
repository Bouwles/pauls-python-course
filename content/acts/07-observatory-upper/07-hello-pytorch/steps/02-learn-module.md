---
id: learn-module
type: learn
title: A network as an object
concept: pytorch
code: |
  import numpy as np


  class Linear:
      """What nn.Linear(n_in, n_out) holds and does, in NumPy."""

      def __init__(self, n_in, n_out, rng):
          self.weight = rng.normal(0, np.sqrt(1 / n_in), (n_out, n_in))   # (outputs, inputs)
          self.bias = np.zeros(n_out)

      def __call__(self, x):
          return x @ self.weight.T + self.bias


  rng = np.random.default_rng(0)
  hidden = Linear(64, 32, rng)
  out = Linear(32, 10, rng)
  X = rng.random((5, 64))                      # five digits, 64 greys each
  scores = out(np.maximum(0, hidden(X)))
  print(hidden.weight.shape, scores.shape)
---
In PyTorch a network is a class that inherits from `nn.Module`. Its layers are made in `__init__`, and the route through them is written in `forward`. Calling `model(X)` runs `forward`, and `model.parameters()` hands every weight to the optimiser.

A layer is `nn.Linear(n_in, n_out)`: a weight and a bias, starting small and random, and `X @ W + b` when called. The example is a NumPy copy of one, so you can run it here. It also shows the one surprise: PyTorch keeps the weight as `(outputs, inputs)`, the other way round from your `W1`, and uses its transpose.

Two of them with a ReLU between is your digit reader: 64 greys in, 32 hidden, 10 scores out.

The usual mistake is calling `model.forward(X)`. Call `model(X)`, which does some bookkeeping first.
