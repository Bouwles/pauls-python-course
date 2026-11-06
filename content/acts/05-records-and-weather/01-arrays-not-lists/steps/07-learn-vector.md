---
id: learn-vector
type: learn
title: No loop needed
concept: vectorisation
code: |
  import numpy as np

  readings = np.array([14.0, 16.5, 12.5, 18.0])
  warm = readings >= 15
  print(warm)
  print(warm.sum())
---
**Vectorisation** means working on a whole array at once instead of looping over it. Arithmetic, comparisons and methods all apply to every number.

A comparison gives an array of `True` and `False`, one per number: `readings >= 15` asks every reading at once. `True` counts as 1 when added up, so the `.sum()` of a comparison counts the `True`s. The example prints `[False  True False  True]`, then `2`: two warm days.

It's quicker as well as shorter. A Python loop looks at each number, checks its type and makes a new total, every time round. An array's numbers share one type and sit side by side, so NumPy goes through them in one piece of fast, ready-built code.

The usual slip is to reach for a `for` loop out of habit.
