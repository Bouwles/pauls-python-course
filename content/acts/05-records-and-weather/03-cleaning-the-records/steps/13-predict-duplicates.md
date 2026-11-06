---
id: predict-duplicates
type: predict
title: Arthur Abbott, three times
concept: data-cleaning
code: |
  import pandas as pd

  crew = pd.DataFrame({"name": ["Arthur Abbott", "Arthur Abbott", "Ada Penrose", "Arthur Abbott"]})
  kept = crew.drop_duplicates()
  print(kept.index.tolist())
  print(kept.reset_index(drop=True).index.tolist())
question: "`index` is a table's row labels. What does this print?"
options:
  - text: |-
      [0, 2]
      [0, 1]
    correct: true
    feedback: "Right. The first Arthur stays, with Ada, and both keep their labels. `reset_index(drop=True)` numbers them 0 and 1 again."
  - text: |-
      [0, 1]
      [0, 1]
    misconception: filter-renumbers-rows
    feedback: "Dropping rows doesn't renumber the ones left. Ada keeps her label, 2, until `reset_index` gives out new ones."
  - text: |-
      [2, 3]
      [0, 1]
    misconception: dedupe-keeps-last
    feedback: "`drop_duplicates` keeps the first copy of each row and drops the later ones, so Arthur stays at label 0."
---
Three copies of one volunteer, and one of somebody else.
