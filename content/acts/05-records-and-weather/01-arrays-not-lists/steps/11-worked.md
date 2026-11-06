---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "Yahya's thermometers. Same shape of problem as a curve, different wall."
code: |
  import numpy as np

  # Noon readings in degrees: one row per day, one column per thermometer
  readings = np.array([[14.0, 15.0, 13.5],
                       [16.5, 17.5, 16.1],
                       [12.5, 13.5, 11.9],
                       [18.0, 19.0, 17.5],
                       [14.0, 15.0, 13.5]])

  thermometer_means = readings.mean(axis=0)

  # The reference thermometer averaged 15.0 over the same days
  correction = 15.0 - thermometer_means
  corrected = readings + correction

  warm = corrected >= 15
  warm_days = warm.sum(axis=0)

  print(thermometer_means)
  print((readings >= 15).sum(axis=0))
  print(warm_days)
subgoals:
  - label: One row per day, one column per thermometer
    lines: [3, 8]
  - label: Collapse the axis you don't want
    lines: [10, 10]
  - label: Broadcast one number per column
    lines: [12, 14]
  - label: Compare the whole array at once
    lines: [16, 16]
  - label: Count the Trues
    lines: [17, 17]
explain:
  prompt: "Why can Paul add `correction` to `readings` with no `keepdims`, when taking each day's average off would need it?"
  answer: "The correction is one number per thermometer, shape (3,), and shapes line up from the right, where the thermometers are. One number per day would be shape (5,), which meets the thermometers' axis and fails. It needs keepdims=True to stand as a column, shape (5, 1)."
  concept: broadcasting
---
Three thermometers outside the Archive window, and the middle one reads high. Paul lines each one up with the reference thermometer, then counts the readings of 15 degrees or more.

Run it. Before the correction, the high thermometer finds four warm days. After it, all three agree on two. Nothing in it is done one reading at a time.

The labels beside the code are the steps he took. Your grade book takes the same steps, and they're in your file as comments.
