---
id: worked
type: worked
title: How Paul would scale it
dialogue:
  - paul.neutral.point: "Saturday open days. Visitors through the door and rain, against cups of coffee poured."
  - caitlin.laughing: "Four hundred visitors and the machine's dry by ten. Rain, and it's just us."
code: |
  import numpy as np

  # Open days: visitors, rain in mm, cups of coffee poured
  saturdays = np.array([
      [310, 0.0, 52],
      [120, 8.5, 21],
      [250, 2.0, 44],
      [400, 0.5, 66],
      [180, 12.0, 25],
      [220, 4.0, 37],
  ])
  X = saturdays[:, :2]
  cups = saturdays[:, 2]

  means = X.mean(axis=0)
  spreads = X.std(axis=0)
  X_scaled = (X - means) / spreads

  w = np.zeros(X.shape[1])
  b = 0.0
  for step in range(300):
      miss = X_scaled @ w + b - cups
      dw = 2 * X_scaled.T @ miss / len(cups)
      db = 2 * np.mean(miss)
      w = w - 0.1 * dw
      b = b - 0.1 * db

  with_ones = np.column_stack([X_scaled, np.ones(len(X))])
  exact = np.linalg.lstsq(with_ones, cups, rcond=None)[0]
  print("By descent:      ", np.round(w, 2), round(b, 2))
  print("By least squares:", np.round(exact[:2], 2), round(exact[2], 2))

  next_saturday = (np.array([350, 1.0]) - means) / spreads
  print(f"Next Saturday: about {next_saturday @ w + b:.0f} cups")
subgoals:
  - label: Load the readings
    lines: [3, 13]
  - label: Scale each column
    lines: [15, 17]
  - label: Start from a guess
    lines: [19, 20]
  - label: Slopes for every weight at once
    lines: [21, 24]
  - label: Step downhill
    lines: [25, 26]
  - label: Check against least squares
    lines: [28, 31]
  - label: Scale new readings the same way
    lines: [33, 34]
explain:
  prompt: "With unscaled pressure, a rate of 0.005 blew up. Here the rate is 0.1. Why can scaled readings take a rate twenty times bigger?"
  answer: "How big a step is safe depends on the steepest direction of the loss, and a column of big numbers, like visitors in the hundreds, makes the loss very steep in its weight's direction. A rate that suits the rain overshoots for the visitors. Scaled, every column has a spread of 1, so the loss is roughly as steep in every direction and one rate suits every weight."
  concept: feature-scaling
---
Paul wants to know how much coffee to have in for an open day, from the visitor count and the rain: hundreds of visitors, a few millimetres of rain.

**Standardising** a column subtracts its mean and divides by its standard deviation, its spread. Every column ends up centred on 0 with a spread of 1, whatever its units, so one learning rate suits every weight. `X.mean(axis=0)` gives one mean per column.

`X_scaled.T @ miss` gives every weight's slope at once: for each column, its readings times the misses, added up.

`np.linalg.lstsq` solves least squares exactly: the formula from the last job, for any number of features. It needs a column of ones to stand in for `b`, and hands back the weights with `b` last.
