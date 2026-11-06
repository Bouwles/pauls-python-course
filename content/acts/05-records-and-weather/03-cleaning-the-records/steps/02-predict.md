---
id: predict-nan
type: predict
title: Not a number
concept: missing-data
dialogue:
  - riya.pleased: "Count the missing ones. They're NaN, so look for NaN. Obviously."
code: |
  import numpy as np
  import pandas as pd

  ages = pd.Series([23, np.nan, 31, np.nan])
  print((ages == np.nan).sum())
  print(ages.isna().sum())
question: What does this print?
options:
  - text: |-
      0
      2
    correct: true
    feedback: "Right. NaN isn't equal to anything, not even another NaN, so `== np.nan` is `False` every time. `isna()` is the only reliable way to find them."
  - text: |-
      2
      2
    misconception: nan-equals-itself
    feedback: "NaN means \"we don't know\", and one unknown isn't equal to another. `np.nan == np.nan` is `False`, so `== np.nan` finds nothing. Use `isna()`."
  - text: A TypeError on line 5
    misconception: nan-comparison-errors
    error: TypeError
    feedback: "Comparing with NaN is allowed. It just never comes out `True`, which is worse than an error, because nothing tells you."
after: |
  Run it. Then add `print(ages.mean())` and see whether the missing ages counted.
---
Four ages from the register, two of them missing, counted two ways.
