---
id: predict-numbers
type: predict
title: None, or nothing?
concept: data-cleaning
code: |
  import pandas as pd

  launches = pd.Series(["7", "none", "3"])
  print(pd.to_numeric(launches, errors="coerce").isna().sum())
  print(pd.to_numeric(launches.replace("none", "0")).isna().sum())
question: What does this print?
options:
  - text: |-
      1
      0
    correct: true
    feedback: "Right. Coercing turns `none` into a missing value. Replacing it first turns it into 0, which is what the volunteer meant."
  - text: |-
      0
      0
    misconception: coerce-reads-words
    feedback: "`errors=\"coerce\"` doesn't know what words mean. Anything that isn't written as a number becomes missing, `none` included."
---
Three volunteers' launches, read as numbers two ways.
