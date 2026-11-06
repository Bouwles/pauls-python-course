---
id: predict-ones
type: predict
title: No column of ones
concept: multivariate-regression
code: |
  import numpy as np

  x = np.array([1.0, 2.0, 3.0])
  y = np.array([3.0, 5.0, 7.0])

  table = np.column_stack([x])
  print(np.linalg.lstsq(table, y, rcond=None)[0].round(2))
question: What does this print?
options:
  - text: "[2.43]"
    correct: true
    feedback: "Right. One column, so one weight, and no `b`. The line has to pass through zero, so it tilts steeper than 2 to get near the points."
  - text: "[2. 1.]"
    misconception: lstsq-finds-intercept
    feedback: "`lstsq` never adds a `b` for you. With one column it finds one weight, for a line through zero. The column of ones is what gives it a `b`."
  - text: "[2.]"
    misconception: lstsq-finds-intercept
    feedback: "2 is the slope of the real line, `y = 2x + 1`. Without a `b`, the best line through zero has to tilt more steeply to get close to the points."
---
The same three points as the example, without the column of ones.
