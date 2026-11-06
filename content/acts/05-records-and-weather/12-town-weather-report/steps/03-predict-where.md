---
id: predict-where
type: predict
title: No negative rain
concept: data-cleaning
code: |
  import pandas as pd

  rain = pd.Series([12.0, -1.0, 30.0])
  print(rain.where(rain >= 0, 0.0).tolist())
question: What does this print?
options:
  - text: "[12.0, 0.0, 30.0]"
    correct: true
    feedback: "Right. Where the rain is 0 or more, it's kept. Where it isn't, the -1 typed by mistake, it takes the 0.0 instead."
  - text: "[0.0, -1.0, 0.0]"
    misconception: where-replaces-true
    feedback: "`where` keeps the values where the condition is `True` and replaces the rest. Here that keeps the 12 and the 30."
  - text: "[12.0, 30.0]"
    misconception: where-drops-rows
    feedback: "`where` never drops a row. Every row stays, and the ones that fail the condition take the other value."
---
A month's rain can't be below nought. Someone typed `-1`.
