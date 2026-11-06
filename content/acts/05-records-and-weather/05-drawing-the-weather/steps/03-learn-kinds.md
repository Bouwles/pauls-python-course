---
id: learn-kinds
type: learn
title: Bars, counts and dots
concept: matplotlib
code: |
  import matplotlib.pyplot as plt

  rain = [80, 95, 130, 45, 110, 98]

  fig, ax = plt.subplots()
  counts, edges, bars = ax.hist(rain, bins=[0, 50, 100, 150])
  print(counts)
  print(len(ax.patches))
  plt.show()
---
Different questions need different charts, and each is a method on the axes:

- `ax.bar(x, heights)` draws a bar for each value: amounts, like each year's rain.
- `ax.hist(values, bins=...)` sorts the values into ranges, the **bins**, and draws a bar for how many fell in each: how often.
- `ax.scatter(x, y)` draws a dot for each pair, to see whether two things go together.
- `ax.axhline(0)` draws a flat line right across, at 0.

`ax.patches` is the list of bars on an axes. The example's histogram counts six months of rain into three bins: one under 50 mm, three from 50 to 100, two from 100 to 150. It prints `[1. 3. 2.]`, then `3`.

The usual slip is to mix up bars and a histogram. Bars show the values; a histogram counts them.
