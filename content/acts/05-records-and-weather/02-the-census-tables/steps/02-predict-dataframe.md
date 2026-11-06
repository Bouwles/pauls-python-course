---
id: predict-dataframe
type: predict
title: Rows, then columns
concept: pandas-basics
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Edith Rowe", "Walter Rook", "Mary Rook", "Sam Rook"],
      "age": [34, 88, 52, 9],
  })
  print(people.shape)
  print(people["age"].max())
question: What does this print?
options:
  - text: |-
      (4, 2)
      88
    correct: true
    feedback: "Right. Four people, so four rows, and two columns. `max()` on the age column gives the biggest age, not the person."
  - text: |-
      (2, 4)
      88
    misconception: shape-columns-first
    feedback: "`shape` gives rows first, then columns, as it does for an array. There are four rows, one per person."
  - text: |-
      (4, 2)
      Walter Rook
    misconception: max-gives-row
    feedback: "`people[\"age\"]` is only the ages, so `.max()` can only give an age back. Finding whose it is takes a filter or a sort."
---
Four people from the 1921 census.
