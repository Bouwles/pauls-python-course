---
id: learn-reinforce
type: learn
title: Whatever went well, more often
concept: policy-gradients
code: |
  import numpy as np


  def chances(prefs):
      weights = np.exp(prefs - prefs.max())
      return weights / weights.sum()


  prefs = np.zeros(4)
  action, ret = 0, 2.0                          # it went up, and the race from here was worth 2
  grad = np.eye(4)[action] - chances(prefs)     # 1 for the move made, minus the chances
  print(grad)
  prefs += 0.5 * ret * grad                     # a step uphill, rate 0.5
  print(chances(prefs).round(2))
---
After each race, **REINFORCE** takes every move's **return to go**, the return from that move to the end, and nudges that tile's preferences.

The nudge is the return times the gradient of the log of that move's chance. For a softmax that gradient is simple: 1 for the move made, minus the chances, on that tile, and zero everywhere else. `np.eye(4)[action]` is four numbers with a 1 at `action`. Step uphill: add a small `rate` times the nudge.

A good return makes the move more likely; a poor one, less. The example prints the gradient, `[ 0.75 -0.25 -0.25 -0.25]`, then the new chances: up has risen to `0.48`.

The usual mistake is changing only the move made. The minus-chances part moves every preference on the tile.
