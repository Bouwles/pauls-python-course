---
id: predict-trend
type: predict
title: Slope first
concept: descriptive-statistics
code: |
  import numpy as np

  x = np.array([0, 1, 2, 3])
  y = np.array([5, 7, 9, 11])
  slope, intercept = np.polyfit(x, y, 1)
  print(round(slope, 2), round(intercept, 2))
question: What does this print?
options:
  - text: "2.0 5.0"
    correct: true
    feedback: "Right. The points lie on a straight line, rising 2 for each 1 along, and crossing `x = 0` at 5. `polyfit` gives the slope first."
  - text: "5.0 2.0"
    misconception: polyfit-intercept-first
    feedback: "`np.polyfit(x, y, 1)` gives the slope first, then the intercept. Unpacked in that order, `slope` is 2."
  - text: "6.0 5.0"
    misconception: trend-is-last-minus-first
    feedback: "6 is the last value minus the first. The slope is the rise for each 1 along: 2, three times over."
---
Four points that lie exactly on a line.
