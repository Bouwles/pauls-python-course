---
id: learn-filter
type: learn
title: Keep the rows that match
concept: selecting-filtering
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Edith Rowe", "Walter Rook", "Mary Rook", "Sam Rook"],
      "parish": ["Church Street", "Bankside", "Bankside", "Bankside"],
      "age": [34, 88, 52, 9],
  })
  print(people[people["age"] > 50])
  print(len(people[people["age"] > 50]))
---
To keep only some rows, put a condition inside the square brackets. `people["age"] > 50` asks every row at once, and gives a Series of `True` and `False`, one per row. `people[...]` round it keeps the rows marked `True`.

So `people[people["age"] > 50]` is a smaller DataFrame: everyone over 50. It's a new table, and `people` is left as it was. `len()` counts its rows.

The example prints the rows for Walter and Mary, then `2`.

The usual slip is to leave off the table round the condition. `people["age"] > 50` on its own is only the `True`s and `False`s.
