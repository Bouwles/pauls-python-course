---
id: learn-target
type: learn
title: Training on targets
concept: dqn
code: |
  import numpy as np

  gamma = 0.9
  q_now = np.array([1.0, 0.5, -0.2, 2.0])     # the network's four Q-values on the tile it left
  q_after = np.array([2.0, 5.0, 1.0, 3.0])    # and on the tile it landed on
  action, reward, over = 3, -1.0, 0.0          # it went right; 0.0 means the race goes on

  target = reward + gamma * q_after.max() * (1 - over)
  loss = (q_now[action] - target) ** 2
  print(target, loss)
---
The network learns by regression, as in the Model Room: it's given a **target** and nudged towards it.

After a move, the target is the Q-learning target: the reward, plus gamma times the best Q-value on the tile it landed on. `over` is 1.0 if the move ended the race and 0.0 if not, so `(1 - over)` switches the future off at the end.

The **loss** is the squared gap between the target and the network's Q-value for the move the crab actually made. The example's target is `3.5`, its guess was 2.0, and the loss is `2.25`.

The usual mistake is training all four outputs. The other three moves weren't made, so they have no target, and they get no blame.
