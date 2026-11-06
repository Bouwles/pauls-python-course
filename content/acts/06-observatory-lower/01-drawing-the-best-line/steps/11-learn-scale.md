---
id: learn-scale
type: learn
title: Units change the hill
concept: gradient-descent
code: |
  import numpy as np

  areas = np.array([100.0, 150.0, 200.0])
  prices = np.array([210000.0, 390000.0, 510000.0])

  for unit, x in [("square metre", areas), ("hundred square metres", areas / 100)]:
      w, b = 0.0, 0.0
      dw = 2 * np.mean((w * x + b - prices) * x)
      w = w - 0.1 * dw
      print(f"Per {unit}: after one step, w is {w:,.0f}")
---
The same houses can be measured in square metres or in hundreds of square metres. The best line is the same either way. The hill isn't.

`dw` multiplies every miss by `x`. With areas of 100 to 200, the slope is a hundred times bigger than with areas of 1 to 2, so one step at the same rate goes a hundred times further.

The best `w` here is 3,000 dollars a square metre: 300,000 per hundred square metres. In the example, one step at a rate of 0.1 jumps to 12 million per square metre, thousands of times too far. In hundreds, it moves to 121,000, a sensible step towards 300,000.

The usual mistake is thinking a rate is safe or unsafe on its own. It depends on the size of the numbers going in.
