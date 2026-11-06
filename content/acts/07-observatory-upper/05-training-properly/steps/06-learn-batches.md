---
id: learn-batches
type: learn
title: A handful at a time
concept: optimisers
code: |
  import numpy as np

  X = np.array([[1], [2], [3], [4], [5], [6], [7]])      # seven evenings
  T = X * 10                                            # each answer is its evening times ten

  rng = np.random.default_rng(4)
  order = rng.permutation(len(X))                       # one shuffle, for both
  for start in range(0, len(X), 3):
      rows = order[start:start + 3]
      print(X[rows].ravel(), T[rows].ravel())
---
Training on all eight hundred evenings at once gives one step per pass through the log. A **mini-batch** is a handful, a few dozen evenings, and each handful gets its own step: twenty-five steps a pass instead of one. Each gradient is a noisier estimate, but there are far more of them. One pass through every evening is an **epoch**.

Shuffle every epoch, so the handfuls differ. Shuffle one list of row numbers with `rng.permutation`, and use it for the readings and the answers alike, so each evening keeps its answers. `range(0, len(X), 3)` starts a batch every 3 rows, right to the end, so the last batch here is one evening.

The usual mistake is shuffling the two arrays separately. Then every answer belongs to a different evening.
