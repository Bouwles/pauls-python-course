---
id: predict-quartiles
type: predict
title: A quarter of the way up
concept: descriptive-statistics
code: |
  import pandas as pd

  temps = pd.Series([4, 6, 8, 10, 12])
  print(temps.quantile(0.25), temps.quantile(0.75))
question: What does this print?
options:
  - text: "6.0 10.0"
    correct: true
    feedback: "Right. Sorted, the readings are 4, 6, 8, 10, 12. A quarter of the way up is the 6, three quarters the 10."
  - text: "3.0 9.0"
    misconception: quantile-is-share-of-max
    feedback: "That's a quarter and three quarters of 12, the biggest reading. A quantile is a position in the sorted readings, not a share of the largest."
---
Five temperatures, already in order.
