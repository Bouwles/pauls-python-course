---
id: predict-labels
type: predict
title: Row nought
concept: selecting-filtering
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Edith Hollis", "Walter Rook", "Mary Rook", "Sam Rook"],
      "age": [34, 88, 52, 9],
  })
  older = people[people["age"] > 50]
  print(older.loc[0, "name"])
question: What happens?
verify: error
options:
  - text: "It prints Walter Rook"
    misconception: filter-renumbers-rows
    feedback: "Walter is the first row of `older`, but filtering doesn't renumber anything. He keeps his label, 1, and there's no row labelled 0 left."
  - text: "It prints Edith Hollis"
    misconception: loc-reads-original
    feedback: "`older` is a table of its own. `.loc` only looks in `older`, and Edith was filtered out of it."
  - text: A KeyError
    correct: true
    error: KeyError
    feedback: "Right. Filtering keeps each row's original label: Walter is still 1 and Mary is still 2. There's no row 0 in `older`, and `.loc` goes by label. `.iloc[0]` would give the first row, whatever its label."
after: |
  Run it. Then print `older` to see its labels, and try `older.iloc[0]["name"]` and `older.loc[1, "name"]`.
---
`.loc[row, column]` looks up one value by its labels. Every row has a label, shown down the left when you print a table, and `read_csv` labels them 0, 1, 2 and so on.

`.iloc[position]` counts positions instead, from 0, whatever the labels say.
