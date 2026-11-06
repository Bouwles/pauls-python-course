---
id: learn-outliers
type: learn
title: Readings that don't fit
concept: distributions
code: |
  import pandas as pd

  readings = pd.Series([1, 2, 3, 4, 5, 6, 7, 8, 100])
  q1 = readings.quantile(0.25)
  q3 = readings.quantile(0.75)
  low = q1 - 1.5 * (q3 - q1)
  high = q3 + 1.5 * (q3 - q1)
  print(low, high)
  print(readings[(readings < low) | (readings > high)].tolist())
---
A reading far from the rest is an **outlier**. A common rule builds **fences** from the quartiles: the low fence is `q1` minus one and a half times `q3 - q1`, the high fence `q3` plus the same. Anything outside the fences is flagged.

The fences come from the quartiles, not the mean and standard deviation, because one wild reading drags the mean and the spread towards itself, and fences built from them would move out to meet it.

The example's fences are `-3.0` and `13.0`, and it flags the `100`.

The usual slip is to delete an outlier on sight. It might be a broken thermometer, or the most interesting reading of the year. Ask why first.
