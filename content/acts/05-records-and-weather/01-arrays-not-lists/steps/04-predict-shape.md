---
id: predict-shape
type: predict
title: Row first
concept: numpy-arrays
code: |
  import numpy as np

  marks = np.array([[12, 14, 15],
                    [8, 6, 4],
                    [17, 18, 19]])
  print(marks[2, 0])
  print(marks[:, 2])
question: What does this print?
options:
  - text: |-
      17
      [15  4 19]
    correct: true
    feedback: "Right. Row 2 is the third student, and column 0 their first mark. `[:, 2]` is the last mark of every student."
  - text: |-
      15
      [17 18 19]
    misconception: array-index-col-first
    feedback: "The row comes first, then the column. `marks[2, 0]` is row 2, column 0, and `marks[:, 2]` is a column: every row's mark in position 2."
---
Three students, three marks each.
