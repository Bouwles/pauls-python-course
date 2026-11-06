---
id: predict-axis
type: predict
title: Coldest each day
concept: numpy-arrays
code: |
  import numpy as np

  readings = np.array([[14.0, 16.5, 12.5, 18.0],
                       [13.5, 16.0, 12.0, 17.0]])
  print(readings.min(axis=1))
  print(readings.sum(axis=0).shape)
question: What does this print?
options:
  - text: |-
      [12.5 12. ]
      (4,)
    correct: true
    feedback: "Right. `axis=1` squashes each row to one number, its smallest. `axis=0` squashes the two rows together, leaving one number for each of the four columns."
  - text: |-
      [13.5 16.  12.  17. ]
      (2,)
    misconception: axis-names-what-remains
    feedback: "The axis you name is the one that disappears. `axis=1` goes along each row, so there's one answer per row: two of them."
  - text: |-
      12.0
      (4,)
    misconception: axis-gives-one-number
    feedback: "With an axis, a method gives one answer per row or column, not one for the whole array. `min(axis=1)` gives a minimum for each row."
---
Two thermometers outside the Archive, one per row, four days of readings each.
