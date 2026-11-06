---
id: learn-one-hot
type: learn
title: The answer as a row
concept: classification-networks
code: |
  import numpy as np

  labels = np.array([2, 0, 1])
  answers = np.eye(3)[labels]        # one row of the identity matrix per label
  print(np.eye(3))
  print(answers)
---
The network gives a row of chances for each digit. To compare it with the right answer, write the answer as a row too: 1 in the right answer's column, 0 everywhere else. That's **one-hot**. A 7, out of ten digits, is a row with 1 in column 7.

`np.eye(n)` is the identity matrix, from Act V: 1s down the diagonal and 0 elsewhere, so its row `k` is exactly the one-hot row for `k`. Indexing it with an array of labels, `np.eye(3)[labels]`, picks one row per label. The example's labels `[2, 0, 1]` become three rows.

A perfect network's chances would be the one-hot rows themselves.

The usual mistake is reading the one-hot row as the label's number. It's a row of 0s with one 1, in the label's column.
