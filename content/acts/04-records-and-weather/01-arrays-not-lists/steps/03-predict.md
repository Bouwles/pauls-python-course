---
id: predict-broadcast
type: predict
title: Odd shapes
concept: broadcasting
dialogue:
  - pip: "Easy. Take each month's average off, then each year's total. Same trick twice."
code: |
  import numpy as np

  rain = np.array([[80, 60, 40, 70],
                   [90, 50, 30, 90],
                   [70, 70, 50, 50]])
  print((rain - rain.mean(axis=0)).shape)
  print((rain - rain.sum(axis=1)).shape)
question: What happens?
verify: error
options:
  - text: "It prints (3, 4), then stops with a ValueError"
    correct: true
    error: ValueError
    feedback: "Right. NumPy compares shapes from the right-hand end. `(3, 4)` and `(4,)` both end in 4, so the four averages are stretched down all three rows. `(3, 4)` and `(3,)` end in 4 and 3, and NumPy won't guess that you meant the rows."
  - text: "It prints (3, 4) twice"
    misconception: broadcast-matches-rows
    feedback: "NumPy doesn't hunt for an axis that happens to match. It lines shapes up from the right, so a one-dimensional array always meets the columns. Three totals can't be spread across four columns."
  - text: "It stops with a ValueError on the first print"
    misconception: broadcast-needs-same-shape
    error: ValueError
    feedback: "Arrays don't have to be the same shape. A smaller one can be stretched to fit, as long as the shapes agree from the right: `(4,)` against `(3, 4)` is fine."
after: |
  Run it. Then change the last line to use `rain.sum(axis=1, keepdims=True)`, which keeps the totals standing as a column, shape `(3, 1)`, and run it again.
---
When a small array meets a bigger one in arithmetic, NumPy stretches the small one to fit, without copying it. This is called **broadcasting**. It has rules.

`rain` here is three years of four months. `rain.mean(axis=0)` is one average per month. `rain.sum(axis=1)` is one total per year.
