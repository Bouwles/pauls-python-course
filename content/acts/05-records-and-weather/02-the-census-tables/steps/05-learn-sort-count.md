---
id: learn-sort-count
type: learn
title: Sorting and counting
concept: pandas-basics
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Edith Rowe", "Walter Rook", "Mary Rook", "Sam Rook"],
      "parish": ["Church Street", "Bankside", "Bankside", "Bankside"],
      "age": [34, 88, 52, 9],
  })
  print(people.sort_values("age", ascending=False).head(2))
  print(people["parish"].value_counts())
---
Two tools come up all the time.

`table.sort_values("age", ascending=False)` gives back the table sorted by one column, biggest first; leave out `ascending=False` for smallest first. `.head(2)` is the first two rows of whatever it's given.

`table["parish"].value_counts()` counts each different value in a column, most common first. It gives back a Series whose labels are the values: `Bankside 3`, `Church Street 1`.

The example prints the two oldest, then the people in each parish.

The usual slip is to expect `sort_values` to sort the table itself. It hands back a sorted copy, so keep it: `people = people.sort_values("age")`.
