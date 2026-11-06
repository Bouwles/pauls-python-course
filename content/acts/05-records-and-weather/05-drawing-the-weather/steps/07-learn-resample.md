---
id: learn-resample
type: learn
title: Months into years
concept: pandas-basics
code: |
  import pandas as pd

  months = pd.date_range("2023-01-01", periods=24, freq="MS")
  rain = pd.Series([100.0] * 24, index=months)
  rain.iloc[14] = float("nan")

  print(rain.resample("YS").sum().tolist())
  print(rain.resample("YS").count().tolist())
  print(rain.resample("YS").sum(min_count=12).tolist())
---
Before drawing a century, gather the months into years. When a Series is labelled by dates, pandas can **resample** it: `rain.resample("YS").sum()` adds up each year's months, where `"YS"` means years, starting each January. `.mean()` and `.count()` work the same way.

`.rolling(10).mean()` averages each value with the nine before it: a **rolling average**, which smooths the wobble out of a line. The first nine have nothing to average with, so they're `NaN`.

The example makes two years of months, with `pd.date_range` for the dates, and loses one reading. It prints `[1200.0, 1100.0]`, then `[12, 11]`, then `[1200.0, nan]`.

The usual slip is to trust a year with a month missing: eleven months passed off as twelve. `.sum(min_count=12)` makes it `NaN` instead.
