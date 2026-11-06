---
id: learn-q-values
type: learn
title: The worth of a move
concept: q-learning
dialogue:
  - caitlin.thinking: "Values tell you which tiles are good. The crab needs to know which way to go."
code: |
  # What each move is worth on two tiles, if the crab plays its best afterwards.
  Q = {
      (1, 2): {"up": 6.1, "down": -2.0, "left": 1.5, "right": -6.0},
      (0, 2): {"up": 5.0, "down": 3.0, "left": 4.0, "right": 9.0},
  }
  for tile in Q:
      best = max(Q[tile], key=Q[tile].get)
      print(tile, best, Q[tile][best])
---
A tile's value says how good it is to stand there. To turn values into a move, you'd need to know where each move leads, with what chance: the map. The crab has no map.

So it learns a **Q-value** for every tile *and* every move: what that move is worth there, if the crab plays its best afterwards. You met Q-values in the Gridworld Solver, worked out from the map. Now they're learned from races.

With Q-values, choosing is easy: on any tile, the best move is the one with the biggest number. No map needed. The example prints `(1, 2) up 6.1`, then `(0, 2) right 9.0`.

The usual mistake is learning a value per tile and then trying to choose moves from it without the map.
