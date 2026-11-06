---
id: predict-filter
type: predict
title: Under forty
concept: selecting-filtering
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Edith Rowe", "Walter Rook", "Mary Rook", "Sam Rook"],
      "age": [34, 88, 52, 9],
  })
  young = people[people["age"] < 40]
  print(len(young))
  print(len(people))
question: What does this print?
options:
  - text: |-
      2
      4
    correct: true
    feedback: "Right. Edith and Sam are under 40. The filter makes a new table, so `people` still has all four."
  - text: |-
      2
      2
    misconception: filter-changes-original
    feedback: "Filtering hands back a new table and leaves `people` alone. Nobody has been taken out of it."
---
The same four people, filtered.
