---
id: predict-pivot
type: predict
title: Nobody in Bankside
concept: groupby
code: |
  import pandas as pd

  people = pd.DataFrame({
      "year": [1921, 1921, 1951, 1951, 1951],
      "parish": ["Hill", "Bankside", "Hill", "Hill", "Hill"],
  })
  grid = people.pivot_table(index="parish", columns="year", aggfunc="size", fill_value=0)
  print(grid.loc["Bankside", 1951], grid.loc["Hill", 1951])
question: What does this print?
options:
  - text: "0 3"
    correct: true
    feedback: "Right. Nobody in Bankside in 1951, so its cell would be empty, and `fill_value=0` puts 0 there. Three people on the Hill that year."
  - text: "nan 3"
    misconception: fill-value-ignored
    feedback: "Without `fill_value` the empty cell would be `NaN`. With `fill_value=0`, it's 0."
  - text: "1 3"
    misconception: pivot-counts-row-total
    feedback: "A cell counts only the rows with that parish and that year. Bankside's one person is in 1921, not 1951."
---
Five people over two censuses.
