---
id: learn-quartiles
type: learn
title: Quarters of the pile
concept: descriptive-statistics
code: |
  import pandas as pd

  readings = pd.Series([1, 2, 3, 4, 5, 6, 7, 8, 100])
  q1 = readings.quantile(0.25)
  q3 = readings.quantile(0.75)
  print(q1, q3)
  print(q3 - q1)
---
Sort the readings and cut the pile into four equal parts. The cuts are the **quartiles**: a quarter of the readings are at or below `q1`, half at or below the median, and three quarters at or below `q3`.

`values.quantile(0.25)` is `q1`, and `values.quantile(0.75)` is `q3`. Between them lies the middle half of the readings, and `q3 - q1` is how wide it is. One wild reading at the end hardly moves it: the example's 100 changes nothing.

The example prints `3.0 7.0`, then `4.0`.

The usual slip is to read `quantile(0.25)` as a quarter of the biggest reading. It's a quarter of the way up the sorted readings.
