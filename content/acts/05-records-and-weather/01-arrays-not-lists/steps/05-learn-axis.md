---
id: learn-axis
type: learn
title: The axis that disappears
concept: numpy-arrays
code: |
  import numpy as np

  marks = np.array([[12, 14, 16],
                    [8, 6, 4],
                    [17, 18, 19],
                    [11, 10, 6]])
  print(marks.mean(axis=0))
  print(marks.mean(axis=1))
  print(marks.mean())
---
Methods like `.mean()`, `.sum()`, `.min()` and `.max()` work on a whole array. Give them `axis=` and they work one way through it.

`axis=0` runs down the rows: `marks.mean(axis=0)` averages each column, one average per assessment. `axis=1` runs along each row: `marks.mean(axis=1)` averages each student's marks, one per student. With no axis, it averages everything.

Picture squashing the table flat. The axis you name is the one squashed away: a `(4, 3)` array gives shape `(3,)` with `axis=0`, and `(4,)` with `axis=1`.

The example prints three averages, then four, then one for the whole class. The usual slip is to think the axis you name is the one you keep.
