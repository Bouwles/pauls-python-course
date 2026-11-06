---
id: predict-count
type: predict
title: How many parishes?
concept: pandas-basics
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Edith Rowe", "Walter Rook", "Mary Rook", "Sam Rook"],
      "parish": ["Church Street", "Bankside", "Bankside", "Bankside"],
  })
  counts = people["parish"].value_counts()
  print(len(counts))
  print(counts.max())
question: What does this print?
options:
  - text: |-
      2
      3
    correct: true
    feedback: "Right. Two different parishes, so `counts` has two entries, and the biggest count is Bankside's 3."
  - text: |-
      4
      3
    misconception: value-counts-per-row
    feedback: "`value_counts` gives one count for each different value, not one per row. Four people live in two parishes."
---
`counts` is a Series, so `len` and `max` work on it.
