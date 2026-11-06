---
id: learn-pivot
type: learn
title: A grid of answers
concept: groupby
code: |
  import pandas as pd

  people = pd.DataFrame({
      "year": [1921, 1921, 1921, 1951, 1951],
      "parish": ["Bankside", "Bankside", "Hill", "Bankside", "Hill"],
      "age": [63, 14, 40, 70, 8],
  })
  print(people.pivot_table(index="parish", columns="year", aggfunc="size", fill_value=0))
  print(people.pivot_table(index="parish", columns="year", values="age", aggfunc="max"))
---
A **pivot table** lays grouped answers out as a grid, the shape of Yahya's wall chart. `index` goes down the side, `columns` across the top, and each cell holds the answer for that pair.

`aggfunc="size"` counts the rows in each cell. To work something out from a column instead, name it with `values` and say how: `values="age", aggfunc="max"` is the oldest in each cell. A cell with nobody in it is `NaN`, unless you give `fill_value=0`.

The example prints how many people lived in each parish in each year, then the oldest in each.

The usual slip is to swap `index` and `columns`. Remember: `index` is what you read down the side.
