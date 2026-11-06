---
id: learn-and
type: learn
title: Two conditions at once
concept: selecting-filtering
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Edith Rowe", "Walter Rook", "Mary Rook", "Sam Rook"],
      "parish": ["Church Street", "Bankside", "Bankside", "Bankside"],
      "age": [34, 88, 52, 9],
  })
  both = people[(people["age"] > 50) & (people["parish"] == "Bankside")]
  print(len(both))
  either = people[(people["age"] > 80) | (people["age"] < 10)]
  print(len(either))
---
To filter on two conditions, combine their Series of `True` and `False` row by row: `&` for and, `|` for or.

`(people["age"] > 50) & (people["parish"] == "Bankside")` is `True` only in the rows where both are. Put brackets round each condition. Python does `&` before `>` and `==`, so without them it reads the line the wrong way.

The example prints `2`, Walter and Mary, then `2` again: Walter is over 80 and Sam under 10.

The usual slip is to write `and` or `or`. Those ask whether a whole Series is true, which has no single answer, so pandas stops with a `ValueError`.
