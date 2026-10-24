---
id: reading
type: reading
title: Adam
dialogue:
  - wendt: "Her notebook, page forty. One word: Adam. Then six lines, and a small drawing of a hill."
code: |
  # Adam, for one weight array w and its gradient g, at step t (1, 2, 3...)
  m = beta1 * m + (1 - beta1) * g          # running average of the gradient
  v = beta2 * v + (1 - beta2) * g ** 2     # running average of its square

  m_hat = m / (1 - beta1 ** t)             # m and v start at 0, so early on
  v_hat = v / (1 - beta2 ** t)             # they're too small: this undoes it

  w -= rate * m_hat / (np.sqrt(v_hat) + eps)

  # Usual settings: rate 0.001, beta1 0.9, beta2 0.999, eps 1e-8
---
Momentum gives every weight the same rate. **Adam** gives each weight its own.

`m` is a velocity, like momentum's, but averaged. `v` measures how big that weight's gradients usually are. Dividing by `np.sqrt(v_hat)` evens them out: a weight with huge gradients takes modest steps, and one with tiny gradients takes bigger ones. `eps` only stops a division by 0.

On the very first step, `m_hat` is `g` and `v_hat` is `g ** 2`, so every weight moves by almost exactly `rate`, whichever way its gradient points and however big it is.

Each weight array keeps its own `m` and `v`, starting at zeros. `t` counts steps, not arrays: it goes up once per call to `step`, however many weights there are.

An **optimiser** is whichever rule turns gradients into steps: plain descent, momentum, Adam.
