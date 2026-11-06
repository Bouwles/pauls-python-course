---
id: predict-skew
type: predict
title: One long wait
concept: distributions
code: |
  import pandas as pd

  late = pd.Series([2, 2, 3, 3, 3, 4, 40])
  print(late.mean() > late.median())
question: What does this print?
options:
  - text: "True"
    correct: true
    feedback: "Right. The 40 is a long tail to the right, and it drags the mean up to about 8.1. The median stays at 3, the middle wait."
  - text: "False"
    misconception: extreme-moves-median
    feedback: "The median is the middle reading in order, and one huge reading only moves the end of the list. It stays at 3, while the 40 lifts the mean past it."
---
Minutes the Archive's bus was late, one week. One morning it broke down.
