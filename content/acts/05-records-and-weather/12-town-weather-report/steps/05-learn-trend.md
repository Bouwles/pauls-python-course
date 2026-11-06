---
id: learn-trend
type: learn
title: A straight line through the years
concept: descriptive-statistics
code: |
  import numpy as np

  years = np.array([2000, 2001, 2002, 2003, 2004])
  temps = np.array([11.00, 11.05, 11.01, 11.08, 11.06])
  slope, intercept = np.polyfit(years, temps, 1)
  print(round(slope, 3))
  print(round(slope * 10, 2), "degrees a decade")
---
How fast has it warmed? Picture a ruler laid across a scatter of yearly temperatures, as close to all the dots as a straight line can get. Its slope, degrees per year, is the **trend**.

`np.polyfit(x, y, 1)` finds that line. The `1` asks for a straight one, and it gives back two numbers: the slope, then the intercept, where the line crosses `x = 0`. `slope, intercept = np.polyfit(years, temps, 1)` unpacks them.

The example's five years wobble up and down, but the line through them rises `0.015` degrees a year, `0.15` a decade.

The usual slip is to take the last year minus the first. Two years are mostly luck; the line uses every one.
