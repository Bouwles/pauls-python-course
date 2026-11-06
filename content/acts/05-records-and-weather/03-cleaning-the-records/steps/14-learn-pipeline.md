---
id: learn-pipeline
type: learn
title: One step at a time
concept: data-cleaning
code: |
  import pandas as pd


  def tidy(table):
      clean = table.copy()
      clean["name"] = clean["name"].str.strip().str.title()
      return clean


  def dedupe(table):
      return table.drop_duplicates().reset_index(drop=True)


  PIPELINE = [tidy, dedupe]

  raw = pd.DataFrame({"name": [" helen rowe", "Helen Rowe", "Peter Jago"]})
  table = raw
  for step in PIPELINE:
      table = step(table)
  print(table["name"].tolist())
  print(raw["name"].tolist())
---
A **pipeline** is a list of cleaning steps, each a function that takes a table and gives back a cleaner one. Run them in order, and what comes out of one goes into the next.

Each step starts with `table.copy()` and changes only the copy, so the table it was given is left as it was. Then each step can be checked on its own, and the raw data is never written on.

Functions are values, so they can go in a list, and a loop hands the table to each in turn. The example prints the cleaned names, `['Helen Rowe', 'Peter Jago']`, then the raw ones, unchanged.

The usual slip is to change the table a step was given. Run the pipeline twice, and the second run starts from half-cleaned data.
