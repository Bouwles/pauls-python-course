---
id: learn-two-dials
type: learn
title: Two dials, two slopes
concept: gradient-descent
code: |
  import numpy as np

  x = np.array([1.0, 2.0, 3.0])
  y = np.array([3.0, 5.0, 7.0])      # these sit exactly on y = 2x + 1

  w, b = 0.0, 0.0
  rate = 0.1
  for step in range(500):
      miss = w * x + b - y
      dw = 2 * np.mean(miss * x)     # the slope for w, with b held still
      db = 2 * np.mean(miss)         # the slope for b, with w held still
      w = w - rate * dw
      b = b - rate * db
  print(round(w, 3), round(b, 3))
---
A line has two dials, so its hill has two directions. Each dial gets its own slope, measured with the other held still, like the park hill's east and north slopes in Act V. For the mean squared error, the chain rule gives:

```text
dw = 2 * mean((w * x + b - y) * x)
db = 2 * mean(w * x + b - y)
```

Say `dw` as "the slope for `w`", and `db` as "the slope for `b`". Each step works out both slopes where it stands, then moves both dials downhill.

The three points in the example sit exactly on the line `y = 2x + 1`. Starting from `w = 0` and `b = 0`, 500 steps land on `2.0 1.0`.

The usual mistake is a miss the wrong way round. `y - (w * x + b)` flips both slopes, and every step walks uphill.
