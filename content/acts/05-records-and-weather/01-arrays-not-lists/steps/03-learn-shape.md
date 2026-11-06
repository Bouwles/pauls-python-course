---
id: learn-shape
type: learn
title: Rows and columns
concept: numpy-arrays
code: |
  import numpy as np

  marks = np.array([[12, 14, 15],
                    [8, 6, 4],
                    [17, 18, 19],
                    [11, 10, 6]])
  print(marks.shape)
  print(marks[1, 2])
  print(marks[:, 0])
---
An array can have rows and columns, like a table. Make one from a list of lists: each inner list is a row. Picture Yahya's grade book: one row per student, one column per mark.

Its **shape** says how many items lie along each **axis**, the rows and the columns: `(4, 3)` is 4 rows of 3.

`marks[1, 2]` is row 1, column 2, both counting from 0. A colon means all of them: `marks[:, 0]` is column 0 of every row, the first mark of every student. The example prints `(4, 3)`, `4`, then `[12  8 17 11]`. NumPy pads numbers to the same width, so some get two spaces before them.

The usual slip is to count from 1. Row 1 is the second student.
