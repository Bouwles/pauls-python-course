---
id: learn-gaps
type: learn
title: A gap is not a zero
concept: missing-data
code: |
  import pandas as pd

  rain = pd.Series([90.0, 80.0, None, 100.0])    # four months, one of them missing
  print(rain.sum())
  print(rain.sum(min_count=4))
---
pandas skips missing values when it adds up. That's usually what you want, and for yearly totals it's a trap: a year with a month missing comes out as a dry year that never happened.

`sum(min_count=12)` refuses to add up fewer than twelve real values. With fewer, the answer is `NaN`, missing, which is the truth: nobody knows that year's total. The example adds four months with one missing and prints `270.0`, then `nan` with `min_count=4`.

Leave such years out of yearly figures, and say how many you left out. Never fill a gap with a guess and then count it as a measurement.

The usual mistake is trusting a total without asking how many values went into it.
