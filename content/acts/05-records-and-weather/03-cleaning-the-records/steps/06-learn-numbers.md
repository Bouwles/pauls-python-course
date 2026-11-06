---
id: learn-numbers
type: learn
title: Text that should be numbers
concept: data-cleaning
code: |
  import pandas as pd

  ages = pd.Series(["19", "unknown", "31"])
  print(pd.to_numeric(ages, errors="coerce").tolist())

  launches = pd.Series(["none", "4", "12"])
  print(pd.to_numeric(launches.replace("none", "0")).tolist())
---
One word in a column of numbers, like `unknown`, and pandas reads the whole column as text, so nothing can be added up.

`pd.to_numeric(column)` reads text as numbers. Give it `errors="coerce"` and anything it can't read becomes `NaN`, missing, instead of stopping the program.

Some words mean a number. In the register, `none` launches means 0. `column.replace("none", "0")` swaps every value that is exactly `none` for `"0"`, before the numbers are read.

The example prints `[19.0, nan, 31.0]`, then `[0, 4, 12]`.

The usual slip is to coerce a word that has a meaning. `errors="coerce"` would make `none` missing, not 0. Replace it first.
