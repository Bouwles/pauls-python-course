---
id: learn-thompson
type: learn
title: A belief, not a number
concept: exploration-exploitation
code: |
  import numpy as np

  rng = np.random.default_rng(2)
  print(rng.beta(0 + 1, 0 + 1, size=5).round(2))     # nobody shown it yet
  print(rng.beta(30 + 1, 70 + 1, size=5).round(2))   # 30 played, 70 walked on

  wins = np.array([30, 0])
  losses = np.array([70, 0])
  draws = rng.beta(wins + 1, losses + 1)             # one draw for each screen
  print(draws.round(2), np.argmax(draws))
---
**Thompson sampling** keeps a belief about each screen: not one rate, but how likely each rate is.

With `wins` visitors who played and `losses` who walked on, the belief is a **Beta distribution**, Beta(wins + 1, losses + 1). Picture a hill over the rates from 0 to 1, peaking near the share who played, and narrowing as visitors add up. The `+ 1`s give an unseen screen a flat hill: any rate, equally likely.

`rng.beta(a, b)` draws one rate from the hill. For each visitor, Thompson draws one rate per screen and shows the biggest. In the example, the unseen screen drew 0.71 and won.

The usual mistake is thinking a screen with little evidence is ignored. Its wild draws win about as often as it might really be the best.
