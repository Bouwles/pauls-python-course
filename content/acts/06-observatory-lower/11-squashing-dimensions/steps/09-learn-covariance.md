---
id: learn-covariance
type: learn
title: How columns move together
concept: pca
dialogue:
  - paul.neutral.point: "A tailor's records. When the chest is generous, so is the waist. Usually."
code: |
  import numpy as np

  # Chest and waist of four customers, in cm
  X = np.array([[96.0, 80.0],
                [100.0, 85.0],
                [104.0, 86.0],
                [108.0, 93.0]])

  centred = X - X.mean(axis=0)
  spread = centred.T @ centred / (len(X) - 1)
  print(spread.round(2))
  print(np.cov(X, rowvar=False).round(2))
---
Six columns of spending don't vary separately. A customer who buys a lot of milk usually buys a lot of groceries too. The **covariance matrix** puts that in a table, one row and one column per reading.

Down its diagonal is each column's variance: its spread, squared. Everywhere else is how much each pair moves together: positive when they rise together, negative when one rises as the other falls, near 0 when they don't care.

To work it out, **centre** each column first, taking its mean away, then `centred.T @ centred / (len(X) - 1)`. NumPy's `np.cov` gives the same. In the example, chest and waist move together almost as much as each varies on its own.

The usual mistake is forgetting to centre. Then the table measures how far everyone is from 0, not from each other.
