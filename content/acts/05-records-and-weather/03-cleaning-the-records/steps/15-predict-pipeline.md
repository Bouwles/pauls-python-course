---
id: predict-pipeline
type: predict
title: No copy
concept: data-cleaning
code: |
  import pandas as pd


  def shout(table):
      table["name"] = table["name"].str.upper()
      return table


  raw = pd.DataFrame({"name": ["Peter Jago"]})
  loud = shout(raw)
  print(raw["name"].tolist())
question: What does this print?
options:
  - text: "['PETER JAGO']"
    correct: true
    feedback: "Right. `table` is another name for `raw`, the same table, so changing it changes `raw`. A step that starts with `table.copy()` leaves `raw` alone."
  - text: "['Peter Jago']"
    misconception: function-gets-copy
    feedback: "A function isn't handed its own copy of a table. `table` and `raw` are two names for one table, so `raw` changed too."
---
A step that forgets to copy.
