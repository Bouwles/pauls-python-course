---
id: predict-line
type: predict
title: Two houses, one line
concept: linear-regression
code: |
  import numpy as np

  areas = np.array([100.0, 200.0])
  w = 3000
  b = 50000
  print(w * areas + b)
question: What does this print?
options:
  - text: "[350000. 650000.]"
    correct: true
    feedback: "Right. Each house gets 3,000 dollars a square metre, then `b` adds 50,000 to both. `b` slides the whole line up."
  - text: "[300000. 600000.]"
    misconception: intercept-only-at-zero
    feedback: "That's `w * areas` without `b`. `b` is added to every guess, not just to a house of zero square metres, so both go up by 50,000."
  - text: An error, because a single number can't be added to an array
    misconception: broadcast-needs-same-shape
    error: ValueError
    feedback: "NumPy adds a single number to every item of an array, as in Act V. So `+ b` adds 50,000 to each guess."
---
Different dials this time. Work out each house's guess: `w` times its area, plus `b`.
