---
id: learn-q-learning
type: learn
title: Q-learning
concept: q-learning
code: |
  Q = {
      "A": {"left": 0.0, "right": 0.0},
      "B": {"left": 2.0, "right": 6.0},
  }
  alpha, gamma = 0.1, 0.9

  # On A the crab was told right, got -1, and landed on B. The race goes on.
  target = -1 + gamma * max(Q["B"].values())
  Q["A"]["right"] += alpha * (target - Q["A"]["right"])
  print(round(target, 2), round(Q["A"]["right"], 2))
---
**Q-learning** is TD learning for Q-values. After each step, it updates the move it just made, on the tile it just left.

The target is the reward, plus gamma times the *best* Q-value on the tile it landed on. In words: what this step earned, plus what the next tile is worth if the crab plays its best from there. If the step ended the race, the target is just the reward. Then move the Q-value a fraction alpha of the way towards the target, as TD did.

The example's target is -1 + 0.9 × 6.0, and it prints `4.4 0.44`.

The usual mistake is using the next tile's Q-value for the same move again, or the average of its moves. Q-learning always takes the biggest.
