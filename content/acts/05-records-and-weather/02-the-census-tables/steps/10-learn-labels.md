---
id: learn-labels
type: learn
title: Labels and positions
concept: selecting-filtering
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Edith Rowe", "Walter Rook", "Mary Rook", "Sam Rook"],
      "age": [34, 88, 52, 9],
  })
  older = people[people["age"] > 50]
  print(older)
  print(older.loc[1, "name"])
  print(older["name"].iloc[0])
---
Every row has a **label**, shown down the left when you print a table. `read_csv` labels them 0, 1, 2 and so on. Filtering keeps each row's own label: keep rows 1 and 2, and they're still labelled 1 and 2.

There are two ways to reach a row. `.loc[label, column]` looks a value up by its labels. `.iloc[position]` counts positions from 0, whatever the labels say: on a Series, `.iloc[0]` is the first value.

The example filters the over-fifties, then prints `Walter Rook` twice: once by his label, 1, and once by his position, 0.

The usual slip is `.loc[0]` for the first row of a filtered table. Row 0 may have been filtered out.
