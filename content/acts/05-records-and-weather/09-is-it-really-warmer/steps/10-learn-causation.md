---
id: learn-causation
type: learn
title: Together isn't because
concept: correlation-causation
code: |
  import numpy as np

  years = np.arange(2015, 2025)
  coffee_price = 2.00 + 0.10 * (years - 2015)
  tree_height = 1.0 + 0.5 * (years - 2015)
  print(round(np.corrcoef(coffee_price, tree_height)[0, 1], 2))
---
Two things can rise together without one causing the other. Often a third thing drives both. Ice cream sales and sunburn rise together, and neither causes the other: summer causes both.

Anything that grows steadily with time correlates with anything else that grows with time. The example prints `1.0`, a perfect correlation, between the price of the Studio's coffee and the height of the tree outside the window. Time is the third thing.

So a correlation says two things move together. To say one moves the other, you need more: a reason, or an experiment where you change one and watch the other.

The usual slip is to read a strong r as a cause.
