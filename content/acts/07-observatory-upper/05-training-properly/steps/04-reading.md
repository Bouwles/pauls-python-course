---
id: reading
type: learn
title: Adam
concept: optimisers
dialogue:
  - neil.pleased.point: "Page forty of my notebook. One word: Adam. Then six lines, and a small drawing of a hill."
code: |
  import numpy as np

  rate, beta1, beta2, eps = 0.001, 0.9, 0.999, 1e-8
  w = np.array([1.0, 1.0])
  g = np.array([100.0, 0.01])          # one steep weight, one gentle one
  m, v = np.zeros(2), np.zeros(2)

  for t in range(1, 4):
      m = beta1 * m + (1 - beta1) * g             # running average of the gradient
      v = beta2 * v + (1 - beta2) * g ** 2        # running average of its square
      m_hat = m / (1 - beta1 ** t)                # undo the slow start from 0
      v_hat = v / (1 - beta2 ** t)
      w = w - rate * m_hat / (np.sqrt(v_hat) + eps)
      print(t, w.round(4))
---
Momentum gives every weight the same rate. **Adam** gives each weight its own.

`m` is a running average of the gradient, like momentum's velocity. `v` is a running average of the gradient squared: how big that weight's gradients usually are. Each step divides `m` by the square root of `v`, so a weight with huge gradients takes modest steps and one with tiny gradients takes bigger ones. `eps` only stops a division by 0.

`m` and `v` start at 0, so early on they're too small. `m_hat` and `v_hat` undo that, using `t`, the number of steps so far.

In the example one gradient is 10,000 times the other, and both weights move by `0.001`, the rate, every step.

The usual mistake is expecting a big gradient to mean a big Adam step.
