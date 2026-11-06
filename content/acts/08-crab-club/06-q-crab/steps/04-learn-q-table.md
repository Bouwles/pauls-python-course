---
id: learn-q-table
type: learn
title: The Q-table as an array
concept: q-learning
code: |
  import numpy as np

  Q = np.zeros((3, 4, 4))           # 3 rows, 4 columns, 4 actions: up, down, left, right
  tile = (0, 2)
  Q[tile] = [5.0, 3.0, 4.0, 9.0]    # the four moves on (0, 2)

  print(Q[tile])
  print(Q[tile][3], Q[tile].max(), np.argmax(Q[tile]))
  print(Q.argmax(axis=2))           # the best move on every tile
---
On a real course the crab keeps its Q-values in a NumPy array, the **Q-table**: one number for every row, column and action. The actions become numbers, 0 to 3 for up, down, left and right, so they can index the array.

`np.zeros((3, 4, 4))` starts every Q-value at 0. Index it with a tile, a `(row, col)` tuple, and you get that tile's four Q-values. Then:

- `Q[tile][action]` is one move's worth.
- `Q[tile].max()` is the tile's best Q-value, for the target.
- `np.argmax(Q[tile])` is its best move, the first if they tie.
- `Q.argmax(axis=2)` is the best move on every tile at once: a grid of action numbers.

The example prints the four values on `(0, 2)`, then `9.0 9.0 3`, then a grid with a 3 for right on `(0, 2)`.
