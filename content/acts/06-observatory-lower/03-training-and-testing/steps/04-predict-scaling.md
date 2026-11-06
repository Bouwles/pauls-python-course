---
id: predict-scaling
type: predict
title: Next Saturday, scaled
concept: feature-scaling
code: |
  import numpy as np

  means = np.array([250.0, 4.0])
  spreads = np.array([100.0, 2.0])

  next_saturday = np.array([350.0, 1.0])
  print((next_saturday - means) / spreads)
question: What does this print?
options:
  - text: "[ 1.  -1.5]"
    correct: true
    feedback: "Right. 350 visitors is 100 above the mean, one spread. 1 mm of rain is 3 below the mean, one and a half spreads."
  - text: "[100.  -3.]"
    misconception: scaling-only-subtracts
    feedback: "That's only the first half: the distance from the mean. Dividing by the spread turns it into spreads from the mean, so the visitors and the rain end up the same size."
  - text: "[3.5 0.5]"
    misconception: scaling-only-divides
    feedback: "That divides without taking the mean away first. The brackets come first: subtract the mean, then divide by the spread."
---
The means and spreads were worked out from past open days. Next Saturday is scaled with the same ones.
