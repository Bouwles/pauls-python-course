---
id: learn-dataframe
type: learn
title: A table with names on its columns
concept: pandas-basics
dialogue:
  - yahya.pleased: "One drawer of the Archive, typed up. Rows of people, columns of facts."
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Edith Rowe", "Walter Rook", "Mary Rook"],
      "age": [34, 88, 52],
  })
  print(people)
  print(people.shape)
  print(people["age"].mean())
---
**pandas** is the library for tables, and everyone imports it as `pd`. Its table is a **DataFrame**: rows, and columns with names, each column holding one type. Picture a census page: a line per person, a heading over each column.

`pd.read_csv("census.csv")` reads a CSV file, header and all, into a DataFrame. The example builds a small one from a dictionary of columns instead.

`people["age"]` picks out one column, a **Series**: a column of values, each with a label, the numbers down the left. A Series works like an array, so `people["age"].mean()` is the average age. The example prints the table, `(3, 2)`, then `58.0`.

The usual slip is picking two columns with `people["name", "age"]`. Two need a list inside: `people[["name", "age"]]`.
