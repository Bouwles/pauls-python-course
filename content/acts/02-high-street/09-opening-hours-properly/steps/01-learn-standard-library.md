---
id: learn-standard-library
type: learn
title: Ready-made modules
concept: standard-library
code: |
  import math
  from datetime import datetime

  when = datetime(2026, 3, 14, 11, 30)
  print(when.strftime("%A"))
  print(when.weekday(), when.hour)
  print(math.ceil(130 / 40))
---
Python comes with a shelf of ready-made modules, the **standard library**. You've used `random`, `string`, `json` and `collections`. Look there before you write your own.

Caitlin's board needs to know what day and hour it is. That's `datetime`.

`datetime(2026, 3, 14, 11, 30)` is one moment: 11:30 on 14 March 2026, a Saturday. `when.weekday()` gives its day as a number, `when.hour` its hour, and `when.strftime("%A")` its day's name. `math.ceil` rounds up to a whole number. The example prints `Saturday`, then `5 11`, then `4`.

The usual slip is with `weekday()`. It counts from Monday, and from 0: Monday is 0 and Sunday is 6.
