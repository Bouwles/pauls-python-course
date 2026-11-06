---
id: predict-agg
type: predict
title: People and trades on the Hill
concept: groupby
code: |
  import pandas as pd

  people = pd.DataFrame({
      "parish": ["Hill", "Bankside", "Hill", "Hill"],
      "occupation": ["baker", "fisherman", "baker", "teacher"],
  })
  summary = people.groupby("parish").agg(
      people=("occupation", "size"),
      trades=("occupation", "nunique"),
  )
  print(summary.loc["Hill", "people"], summary.loc["Hill", "trades"])
question: What does this print?
options:
  - text: "3 2"
    correct: true
    feedback: "Right. Three people on the Hill, and two different trades among them: two bakers and a teacher."
  - text: "3 3"
    misconception: nunique-counts-rows
    feedback: "`nunique` counts different values, so the two bakers count once. That's 2 trades for 3 people."
  - text: "4 3"
    misconception: agg-ignores-groups
    feedback: "Each answer is for one pile. The Hill's pile has three rows; the fisherman is in Bankside's."
---
`summary` has a row for each parish, labelled by its name, so `.loc` finds the Hill.
