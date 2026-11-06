---
id: rule-not-table
type: learn
title: A rule instead of a table
concept: dqn
dialogue:
  - paul.neutral: "A table has a box for every tile. Fine for twelve tiles. Not for a million."
  - paul.thinking: "A network has one rule for all of them. It needs watching."
code: |
  import numpy as np


  def features(tile):
      row, col = tile
      x = np.zeros(7)
      x[row] = 1          # a 1 for the row, among three
      x[3 + col] = 1      # a 1 for the column, among four
      return x


  print(features((2, 0)))
  print(features((2, 3)))

  rng = np.random.default_rng(0)
  W = rng.normal(0, 0.5, (7, 4))   # one layer, to keep it short: 7 numbers in, 4 Q-values out
  print((features((2, 0)) @ W).round(2))
---
Q-learning keeps a table: one number for every tile and every move. **Deep Q**, or DQN (a Deep Q-Network), keeps a neural network instead, like the ones from the Engine Room. In goes a tile, described by its **features**, some numbers that say what it's like. Out come four Q-values, one for each move.

Here a tile is seven numbers: a 1 for its row among three, then a 1 for its column among four. The example prints the features of `(2, 0)` and `(2, 3)`, then four Q-values for the start from untrained weights.

Tiles in the same row share an input, so what the network learns about one tile rubs off on its neighbours. A table can't do that, and a network copes with worlds far too big for any table.
