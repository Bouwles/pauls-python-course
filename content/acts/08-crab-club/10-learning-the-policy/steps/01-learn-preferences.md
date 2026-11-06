---
id: preferences
type: learn
title: Preferences, not values
concept: policy-gradients
dialogue:
  - aaesha.unimpressed: "Values. Q-values. Targets. Frozen copies."
  - caitlin.laughing: "The crab doesn't value tiles. It just goes somewhere."
  - paul.pleased.point: "Then learn where it goes, and skip the worth."
code: |
  import numpy as np


  def chances(prefs):
      weights = np.exp(prefs - prefs.max())   # take away the biggest first: exp can't overflow
      return weights / weights.sum()


  print(chances(np.array([0.0, 0.0, 0.0, 0.0])))
  print(chances(np.array([1.0, 0.0, 0.0, 0.0])).round(2))
  print(chances(np.array([5.0, 0.0, 0.0, 0.0])).round(2))
---
Deep Q learns what each move is worth, then picks the biggest. **Policy gradients** skip the worth and learn the choosing itself.

The crab keeps four **preferences** for every tile, in an array `theta` of shape `(3, 4, 4)`. The **softmax**, from the Engine Room, turns a tile's four into chances: e to the power of each, divided by their total. Taking away the biggest preference first changes nothing about the chances, and stops `np.exp` overflowing.

A bigger preference means a bigger chance, but never certainty. So the crab goes on exploring by itself, until its preferences are far apart. The example prints even chances, then `0.48` for a preference of 1, then `0.98` for a preference of 5.

The usual mistake is thinking it always takes the biggest preference. Every move keeps some chance.
