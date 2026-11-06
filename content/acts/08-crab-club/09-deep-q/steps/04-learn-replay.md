---
id: learn-replay
type: learn
title: A memory, sampled at random
concept: dqn
code: |
  import numpy as np

  memory = []
  for move in range(8):
      memory.append(("move", move))
      memory = memory[-5:]                     # keep only the newest 5
  print([number for _, number in memory])

  rng = np.random.default_rng(2)
  picks = rng.choice(len(memory), size=3, replace=False)
  print([memory[i][1] for i in picks])
---
Trained on each move as it happens, the network wobbles. One move is a lot like the move before it: the same stretch of grid, the same few tiles. Learning from them in order drags every guess towards whatever happened lately.

The first fix is a **replay buffer**: a memory of past moves, each kept as `(tile, action, reward, after, over)`. Past its **capacity**, the oldest is dropped. After each move, the network learns from a **batch** of memories picked at random: early and late, near and far, and each memory gets used many times.

`rng.choice(5, size=3, replace=False)` picks three different positions from 0 to 4. The example prints the five newest moves, `[3, 4, 5, 6, 7]`, then three picked at random.

The usual mistake is replaying memories in the order they happened.
