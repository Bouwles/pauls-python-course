---
id: learn-formula
type: learn
title: The best line
concept: linear-regression
code: |
  import numpy as np

  areas = np.array([100.0, 150.0, 200.0])
  prices = np.array([210000.0, 390000.0, 510000.0])

  area_mean = np.mean(areas)
  price_mean = np.mean(prices)
  w = np.sum((areas - area_mean) * (prices - price_mean)) / np.sum((areas - area_mean) ** 2)
  b = price_mean - w * area_mean
  print(w, b)
---
The **best line** is the one whose dials give the smallest mean squared error. For a line with one input, there's a formula for them. Here `x` is the areas, `y` the prices, and `mean of x` the average area:

```text
w = sum((x - mean of x) * (y - mean of y)) / sum((x - mean of x) ** 2)
b = mean of y - w * mean of x
```

In words: `w` compares how far each house is from the average area with how far its price is from the average price. Then `b` makes the line pass through the average house.

The example prints `3000.0 -80000.0`. No other pair of dials gives these three houses a smaller loss.

The usual mistake is trusting the line far from the houses it was fitted to. A line goes on forever, but it only knows the sales it has seen.
