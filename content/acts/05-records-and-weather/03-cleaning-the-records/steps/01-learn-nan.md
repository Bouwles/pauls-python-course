---
id: learn-nan
type: learn
title: A blank where a number should be
concept: missing-data
dialogue:
  - yahya.unimpressed: "A register with gaps in it. Every register has gaps in it."
code: |
  import numpy as np
  import pandas as pd

  ages = pd.Series([23, np.nan, 31])
  print(ages.isna().sum())
  print(ages.mean())
---
pandas marks a missing number as `NaN`, short for "not a number". NumPy calls it `np.nan`. Picture a blank box on a form: there was meant to be a number there, and nobody wrote one.

`isna()` gives `True` for each missing value, so `.isna().sum()` counts them. Methods like `mean()` skip missing values and work with the ones they know.

The example has three ages, one missing. It prints `1`, then `27.0`, the average of 23 and 31.

The usual slip is `== np.nan`. NaN means "we don't know", and one unknown isn't equal to another, so `np.nan == np.nan` is `False`. Only `isna()` finds them.
