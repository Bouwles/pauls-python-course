---
id: learn-threshold
type: learn
title: From a chance to a decision
concept: logistic-regression
code: |
  import numpy as np

  chances = np.array([0.03, 0.27, 0.55, 0.12, 0.81])
  print((chances >= 0.5).astype(int))
  print((chances >= 0.1).astype(int))
---
The model only ever gives a chance. A clinic needs a decision: invite this person for a blood test, or not.

The decision comes from a **threshold**. Say yes when the chance is at least the threshold, and no otherwise. `chances >= 0.5` does it for a whole array at once, and `.astype(int)` turns its `True` and `False` into 1 and 0.

0.5 is the usual threshold. But it's a choice, and the model doesn't make it. A clinic that would rather not miss anyone might invite everyone at 0.1 or more, as on the second line: more cases found, and more people tested who turn out fine.

The usual mistake is comparing the score, `X @ w + b`, with 0.5. The threshold is for the chance, after the sigmoid.
