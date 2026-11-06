---
id: learn-decay
type: learn
title: Rent on every weight
concept: regularisation
code: |
  rate, decay = 0.5, 0.2
  needed, spare = 2.0, 2.0          # two weights

  for step in range(20):
      needed = needed - rate * (-0.4 + decay * needed)   # the loss pushes this one up by 0.4
      spare = spare - rate * (0.0 + decay * spare)       # nothing defends this one
  print(round(needed, 2), round(spare, 2))
---
Bending sharply through every noisy night takes big weights. **Weight decay** charges them rent.

Before each step, add `decay * W` to every weight matrix's gradient. So every weight shrinks by a share of itself each step, unless the loss pushes back hard enough to keep it. Only the weights that earn their keep stay big, and the network's curve stays smooth.

In the example both weights start at 2. The loss pushes the first one up just as hard as the decay pulls it down, so it stays at `2.0`. Nothing defends the second, and after 20 steps it has shrunk to `0.24`.

Biases are left out: they shift a neuron rather than bend the curve.

The usual mistake is expecting it to take the same amount off every step. It takes a share of what's left.
