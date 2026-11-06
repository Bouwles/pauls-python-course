---
id: predict-angles
type: predict
title: Due south
concept: vectors
code: |
  import numpy as np

  angle = np.radians(180)
  arrow = np.array([5.0 * np.sin(angle), 5.0 * np.cos(angle)])
  print(arrow.round(1))
question: What does this print?
options:
  - text: "[ 0. -5.]"
    correct: true
    feedback: "Right. A bearing of 180 is due south: no east part, and the north part is minus 5. The cosine of 180 degrees is -1."
  - text: "[-5.  0.]"
    misconception: sin-cos-swapped
    feedback: "The sine gives the east part and the cosine the north part, for bearings measured from north. Due south has no east part at all."
  - text: "[ 0.  5.]"
    misconception: arrow-never-negative
    feedback: "An arrow's parts can be negative: minus 5 north is 5 south. A length is never negative, but the parts of an arrow are."
---
Five knots on a bearing of 180, as an arrow.
