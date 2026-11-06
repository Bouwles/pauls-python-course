---
id: learn-centre
type: learn
title: Three kinds of average
concept: descriptive-statistics
dialogue:
  - yahya.unimpressed: "Average daily rain, 2.6 millimetres. The average day never happened."
code: |
  import pandas as pd

  rain = pd.Series([0.0, 0.0, 0.4, 1.2, 9.0])
  print(rain.mean())
  print(rain.median())
  print(rain.mode().tolist())
---
There are three common ways to say what a typical reading is:

- the **mean**: add the readings and share the total out equally, `values.mean()`
- the **median**: the middle reading once they're sorted, `values.median()`. With an even number of readings, it's halfway between the middle two.
- the **mode**: the most common reading, `values.mode()`, which gives a Series in case several tie

Picture five days of rain lined up on a shelf in order: the median is the one in the middle, whatever the end ones say. The example prints `2.12`, `0.4` and `[0.0]`.

The usual slip is to say "the average" without saying which. One very wet day drags the mean a long way; the median barely moves.
