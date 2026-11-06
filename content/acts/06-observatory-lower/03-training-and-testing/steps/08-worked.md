---
id: worked
type: worked
title: How Paul would scale it
dialogue:
  - paul.neutral.point: "Saturday open days: visitors and rain, against cups of coffee poured."
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
  prompt: "Visitors run into hundreds and rain is a few millimetres. Why can the scaled columns share one rate of 0.1?"
  answer: "How big a step is safe depends on how steep the loss is, and a column of big numbers, like visitors in the hundreds, makes it very steep in its weight's direction. A rate that suits the rain would overshoot on the visitors. Scaled, every column has a spread of 1, so the loss is about as steep in every direction, and one rate suits every weight."
  concept: feature-scaling
---
Paul wants to know how much coffee to have in for an open day, from the visitor count and the rain. Every idea in it is one you've just met: a weight per column, standardising, every slope at once, and `lstsq` to check.

The labels beside the code are Paul's steps, and your Build uses the same ones. Look at the last label most: next Saturday is scaled with the means and spreads from the past Saturdays, never its own.
