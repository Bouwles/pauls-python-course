---
id: predict-broadcast
type: predict
title: Odd shapes
concept: broadcasting
dialogue:
  - yahya: "Easy. Take each assessment's average off, then each student's. Same trick twice."
code: |
  import numpy as np

  marks = np.array([[12, 14, 15],
                    [8, 6, 4],
                    [17, 18, 19],
                    [11, 10, 6]])
  print((marks - marks.mean(axis=0)).shape)
  print((marks - marks.mean(axis=1)).shape)
question: What happens?
verify: error
options:
  - text: "It prints (4, 3), then stops with a ValueError"
    correct: true
    error: ValueError
    feedback: "Right. NumPy compares shapes from the right-hand end. `(4, 3)` and `(3,)` both end in 3, so the three averages are stretched down all four rows. `(4, 3)` and `(4,)` end in 3 and 4, and NumPy won't guess that you meant the rows."
  - text: "It prints (4, 3) twice"
    misconception: broadcast-matches-rows
    feedback: "NumPy doesn't hunt for an axis that happens to match. It lines shapes up from the right, so a one-dimensional array always meets the columns. Four averages can't be spread across three columns."
  - text: "It stops with a ValueError on the first print"
    misconception: broadcast-needs-same-shape
    error: ValueError
    feedback: "Arrays don't have to be the same shape. A smaller one can be stretched to fit, as long as the shapes agree from the right: `(3,)` against `(4, 3)` is fine."
after: |
  Run it. Then change the last line to use `marks.mean(axis=1, keepdims=True)`, which keeps the averages standing as a column, shape `(4, 1)`, and run it again.
---
When a small array meets a bigger one in arithmetic, NumPy stretches the small one to fit, without copying it. This is called **broadcasting**. It has rules.

`marks` here is four students, three marks each. `marks.mean(axis=0)` is one average per assessment. `marks.mean(axis=1)` is one average per student.
