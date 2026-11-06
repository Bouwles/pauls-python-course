---
id: learn-where
type: learn
title: Keep it, or take it from elsewhere
concept: data-cleaning
code: |
  import pandas as pd

  temp = pd.Series([50.0, 10.0, 41.0])
  fahrenheit = pd.Series([True, False, True])
  celsius = (temp - 32) * 5 / 9
  print(temp.where(~fahrenheit, celsius).round(1).tolist())

  parts = pd.Series(["1959-12", "1960-1"]).str.split("-", expand=True)
  print(parts[0].tolist(), parts[1].astype(int).tolist())
---
Some cleaning needs a choice for each row: keep the value, or use another. `column.where(condition, other)` keeps each value where the condition is `True`, and takes it from `other`, row for row, where it's `False`.

So to convert only the Fahrenheit rows: `temp.where(~fahrenheit, celsius)`. `~` turns each `True` into `False` and back: keep the temperature where it isn't Fahrenheit, convert it where it is. The example prints `[10.0, 10.0, 5.0]`.

Text holding two numbers can be split: `column.str.split("-", expand=True)` cuts each value at the hyphen and gives back a table, one column per piece. `.astype(int)` turns a column of digits into whole numbers.

The usual slip is to read `where` backwards. It keeps where the condition is `True`.
