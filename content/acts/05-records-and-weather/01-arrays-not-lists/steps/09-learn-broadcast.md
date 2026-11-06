---
id: learn-broadcast
type: learn
title: Stretching to fit
concept: broadcasting
code: |
  import numpy as np

  marks = np.array([[12, 14, 15],
                    [8, 6, 4],
                    [17, 18, 19],
                    [11, 10, 6]])
  averages = marks.mean(axis=0)
  print(averages)
  print(marks - averages)
---
When a small array meets a bigger one in arithmetic, NumPy stretches the small one to fit, without copying it. That's **broadcasting**. `marks - 1` stretches one number over every mark.

A row stretches too. `marks - marks.mean(axis=0)` takes each assessment's average off every mark in its column. Picture laying the row of averages over each row of the table in turn. The example prints the averages, then how far each mark is above or below its column's.

NumPy lines the shapes up from the right-hand end. `(4, 3)` and `(3,)` both end in 3, so they fit. `(4, 3)` and `(4,)` don't, and NumPy stops with a `ValueError`. For one number per row, make it a column, shape `(4, 1)`, with `keepdims=True`.

The usual slip is to expect NumPy to find whichever axis fits.
