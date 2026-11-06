---
id: learn-agg
type: learn
title: Several answers for each pile
concept: groupby
code: |
  import pandas as pd

  people = pd.DataFrame({
      "year": [1921, 1921, 1921, 1951, 1951],
      "parish": ["Bankside", "Bankside", "Hill", "Bankside", "Hill"],
      "age": [63, 14, 40, 70, 8],
  })
  print(people.groupby(["year", "parish"]).size())
  print(people.groupby("parish").agg(people=("age", "size"), oldest=("age", "max")))
---
Group by a list of columns and there's one pile for each combination: `groupby(["year", "parish"])` makes a pile for each parish in each year. The answer is labelled by both, year outside and parish inside.

To work out several things for each pile at once, use `.agg` and name each answer: `people=("age", "size")` counts the rows, `oldest=("age", "max")` takes the biggest age, and `"nunique"` counts the different values in a column. The result is a DataFrame, a row per pile and a column per name.

The example prints the four year-and-parish piles, then a row for each parish: Bankside has 3 people, the oldest 70.

The usual slip is grouping by too little. A household number that starts again every census only names a household together with its year.
