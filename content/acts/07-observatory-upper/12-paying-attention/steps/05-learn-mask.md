---
id: learn-mask
type: learn
title: No looking ahead
concept: attention
code: |
  import numpy as np

  scores = np.array([[1.0, 2.0, 3.0],
                     [1.0, 2.0, 3.0],
                     [1.0, 2.0, 3.0]])
  future = np.triu(np.ones((3, 3), dtype=bool), k=1)    # True above the diagonal
  print(future)

  masked = np.where(future, -np.inf, scores)
  weights = np.exp(masked) / np.exp(masked).sum(axis=1, keepdims=True)
  print(np.round(weights, 2))
---
A model that writes must guess each character from the ones before it. In training it sees a whole line at once, so each query has to be stopped from looking at later characters, or it would learn to copy the answer.

A **causal mask** marks the places a query mustn't look: row `i`, column `j`, wherever `j` comes after `i`. That's everything above the diagonal, and `np.triu(np.ones((n, n), dtype=bool), k=1)` makes it.

Before the softmax, set those scores to minus infinity with `np.where(mask, -np.inf, scores)`. `np.exp(-np.inf)` is exactly 0, so they get no weight at all. In the example the first character can only look at itself, and the last at everything.

The usual mistake is setting the hidden scores to 0. `np.exp(0)` is 1, so they still get a share.
