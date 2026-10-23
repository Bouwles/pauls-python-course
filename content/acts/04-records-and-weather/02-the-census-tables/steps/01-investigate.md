---
id: investigate
type: investigate
title: The census as a table
concept: pandas-basics
dialogue:
  - ashby: "Four censuses, three hundred and nineteen people. I've read every one of them by hand."
code: |
  import pandas as pd

  census = pd.read_csv("census.csv")

  print(census.shape)
  print(census.head())

  ages = census["age"]
  print(type(ages))
  print(ages.mean())

  in_1951 = census[census["year"] == 1951]
  print(len(in_1951))
  print(in_1951["parish"].value_counts())
  print(in_1951[["name", "age"]].sort_values("age", ascending=False).head(3))
tasks:
  - id: shape
    prompt: "Run it. How many rows and columns does the census have?"
    kind: answer
    accept: ["(319, 7)", "319, 7", "319,7", "319 rows and 7 columns", "319 rows, 7 columns", "319 by 7", "319 x 7", "319 rows 7 columns"]
    feedback: "319 rows, one per person, and 7 columns. `shape` works just as it does on an array."
    wrong: "It's the first line printed: rows, then columns."
  - id: series
    prompt: "`census[\"age\"]` is one column. What type of thing is it?"
    kind: answer
    accept: ["Series", "a Series", "pandas.Series", "pd.Series", "<class 'pandas.Series'>", "pandas Series", "a pandas Series", "class 'pandas.Series'"]
    feedback: "A `Series`: one column of values, each with a label. The labels are the numbers down the left of `head()`. A DataFrame is a set of Series, side by side, sharing those labels."
    wrong: "It's the third thing printed. Look after the dot."
  - id: over-eighty
    prompt: "`census[\"year\"] == 1951` gives one `True` or `False` per row, and `census[...]` keeps the rows marked `True`. Write a filter of your own: how many people in the census are over 80?"
    kind: answer
    accept: ["6", "six"]
    feedback: "Six, across all four censuses. `census[census[\"age\"] > 80]` keeps them, and `len()` counts them."
    wrong: "Try `print(len(census[census[\"age\"] > 80]))`."
  - id: engineer
    prompt: "Change your filter to find everyone whose `occupation` is `\"engineer\"`. Who is it?"
    kind: answer
    accept: ["Ada Penhallow", "Penhallow", "A. Penhallow", "A Penhallow"]
    feedback: "Ada Penhallow, 31, on the Hill, in 1981. A household of one. She isn't in the 2011 census."
    wrong: "Filter on `census[\"occupation\"] == \"engineer\"` and print what's left."
---
**pandas** is the library for tables, and everyone imports it as `pd`. `pd.read_csv` reads a CSV file, header and all, into a **DataFrame**: rows, and named columns that each hold one type.

`census["age"]` picks out one column. `census[["name", "age"]]`, with a list inside, picks several.

Put a condition inside the brackets instead, and you get only the rows where it's `True`.

Run it, then answer the questions.
