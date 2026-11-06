---
id: learn-choose-k
type: learn
title: Choosing k
concept: knn
code: |
  import numpy as np
  from collections import Counter

  # One measurement each. The last row is an odd one out among the A's.
  X = np.array([0.0, 0.2, 0.4, 1.0, 1.2, 0.3])
  labels = np.array(["A", "A", "A", "B", "B", "B"])


  def name(point, k):
      nearest = np.argsort(np.abs(X - point))[:k]
      return Counter(labels[nearest]).most_common(1)[0][0]


  for k in [1, 3]:
      right = [name(X[i], k) == labels[i] for i in range(len(X))]
      print(k, round(np.mean(right), 2))
---
`k` is a choice, like the degree in the Exam Score Model, and it's chosen the same way: on a validation set.

With `k = 1`, the model is perfect on its own training rows, because every row is its own nearest neighbour. The example scores itself on its training rows: `k = 1` gets all six, odd one out included. `k = 3` gets five. That doesn't make `k = 1` better. It's remembering, not naming.

A small `k` chases odd cases: one strange penguin in the wrong place decides for everyone near it. A big `k` asks animals from far away, and a rare species gets outvoted by the commonest. The best `k` is in between, at the top of the validation accuracy.

The usual mistake is choosing `k` by training accuracy, which always says 1.
