---
id: learn-monte-carlo
type: learn
title: Race to the end, then look back
concept: monte-carlo
code: |
  gamma = 0.9
  race = [((2, 2), "up", -1), ((1, 2), "up", -1), ((0, 2), "right", 10)]

  total = 0
  for tile, action, reward in reversed(race):
      total = reward + gamma * total
      print(tile, round(total, 2))
---
**Monte Carlo** learning races to the end, then looks back. Each tile the crab stood on gets the return that followed it: its own reward and everything after, discounted from that tile. That return is one sample of the tile's value.

Walk back through the race with the backwards trick, `total = reward + gamma * total`, and each step's total is the return from that step. The example prints `(0, 2) 10.0`, then `(1, 2) 8.0`, then `(2, 2) 6.2`.

One race is one sample, and races vary. So keep a running average of each tile's samples, as the bandit did: many races, and the average settles near the tile's value.

The usual mistake is crediting every tile with the whole race's return. A tile only gets what happened from the moment the crab stood on it.
