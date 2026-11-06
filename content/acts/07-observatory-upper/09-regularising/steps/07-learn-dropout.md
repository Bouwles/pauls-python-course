---
id: learn-dropout
type: learn
title: Half asleep, on purpose
concept: dropout
code: |
  import numpy as np

  rng = np.random.default_rng(1)
  hidden = np.array([[0.5, 1.0, 0.2, 0.8]])       # one night's hidden layer
  rate = 0.5

  keep = rng.random(hidden.shape) >= rate         # True: awake, False: asleep
  print(keep)
  print(hidden * keep / (1 - rate))               # training: some asleep, the rest doubled
  print(hidden)                                   # evaluation: everyone awake, nothing scaled
---
**Dropout** switches off each hidden neuron with chance `rate` on every training step, choosing afresh each time. No neuron can count on any particular other one being there, so the network can't build one fragile path through every noisy night.

A **mask** does it. `rng.random(hidden.shape) >= rate` is `True` for the neurons that stay awake. Multiply by it, and the sleeping ones become 0. Then divide by `1 - rate`: with half the layer asleep, each survivor counts double, so the next layer sees about the same total. The backward pass uses the same mask.

At evaluation nothing sleeps and nothing is scaled. The example's last line is the layer as it's used for a real forecast.

The usual mistake is keeping the same mask every step. Then it's just a smaller network.
