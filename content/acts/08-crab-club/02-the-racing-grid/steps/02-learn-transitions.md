---
id: learn-transitions
type: learn
title: Where a move can lead
concept: mdps
code: |
  import numpy as np

  # Told "up" on (2, 2): every way it can go, as (chance, next tile)
  possible = [(0.8, (1, 2)), (0.1, (2, 1)), (0.1, (2, 3))]
  chances = [chance for chance, _ in possible]
  print(sum(chances))

  rng = np.random.default_rng(5)
  picks = rng.choice(len(possible), p=chances, size=1000)
  print(np.bincount(picks))
---
Told up, the crab goes up eight times in ten, and slips sideways one time in ten each way. The **transitions** list every tile an action can lead to, with its chance. The chances add up to 1: something always happens.

A step off the edge or into the rock leaves the crab where it was, and still costs -1.

*Markov* means the next tile depends only on this tile and this action, not on how the crab got here.

To let chance decide, `rng.choice(3, p=chances)` picks 0, 1 or 2, each with its own chance. The example picks a thousand times and counts: `[802  98 100]`.

The usual mistake is treating the three outcomes as equally likely. Up is eight times likelier than either slip.
