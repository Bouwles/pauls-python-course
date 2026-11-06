---
id: predict-outliers
type: predict
title: Outside the fences
concept: distributions
code: |
  import pandas as pd

  temps = pd.Series([10, 11, 12, 12, 13, 14, 31])
  q1 = temps.quantile(0.25)
  q3 = temps.quantile(0.75)
  low = q1 - 1.5 * (q3 - q1)
  high = q3 + 1.5 * (q3 - q1)
  print(temps[(temps < low) | (temps > high)].tolist())
question: "Here `q1` is 11.5 and `q3` is 13.5. What does this print?"
options:
  - text: "[31]"
    correct: true
    feedback: "Right. The middle half is 2 wide, so the fences sit 3 beyond the quartiles, at 8.5 and 16.5. Only the 31 is outside."
  - text: "[10, 31]"
    misconception: fences-flag-ends
    feedback: "The smallest and largest readings aren't outliers just for being at the ends. The 10 is inside the low fence, 8.5."
  - text: "[]"
    misconception: outlier-needs-huge-gap
    feedback: "The fences are only one and a half middle-halves out: 16.5 at the top. 31 is well past it."
---
A week of temperatures with one odd day.
