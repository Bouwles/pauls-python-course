---
id: predict-dates
type: predict
title: June or October?
concept: data-cleaning
code: |
  import pandas as pd

  day = pd.Series(["06/10/1987"])
  print(pd.to_datetime(day, format="%d/%m/%Y").dt.month.tolist())
  print(pd.to_datetime(day, format="%m/%d/%Y").dt.month.tolist())
question: What does this print?
options:
  - text: |-
      [10]
      [6]
    correct: true
    feedback: "Right. The format says which number is the month. Day first, it's October; month first, June. The text alone can't tell you."
  - text: |-
      [6]
      [6]
    misconception: to-datetime-guesses-formats
    feedback: "pandas reads the date the way the format says. With `%d/%m/%Y`, the 06 is the day and the 10 the month."
---
One date from the register, read with two different formats.
