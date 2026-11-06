---
id: learn-validation
type: learn
title: A third pile, for choosing
concept: train-test-split
code: |
  import numpy as np

  rng = np.random.default_rng(178)
  order = rng.permutation(357)
  test, rest = order[:71], order[71:]
  validation, train = rest[:72], rest[72:]
  print(len(train), len(validation), len(test))
---
To choose between models, say degree 1, 2 or 8, you have to score them on students they didn't learn from. But if you choose with the test set, it has helped you choose, and its score will flatter you.

So keep a third pile, the **validation set**. Learn on the training set, choose with the validation set, and open the test set once, at the very end. The example cuts the 357 students into 214, 72 and 71.

A **validation curve** shows each degree's error on both piles. As the degree rises, the training error only falls. The validation error falls, then climbs once the model starts learning students by heart. Choose its lowest point.

The usual mistake is choosing by the training error, which always picks the biggest model.
