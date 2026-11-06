---
id: learn-log-loss
type: learn
title: How wrong is a chance?
concept: cross-entropy
code: |
  import numpy as np

  happened = np.array([1, 1, 0])          # 1 for yes, 0 for no
  chance = np.array([0.9, 0.1, 0.2])      # the model's chance of yes

  # Each pays minus the log of the chance it gave to what really happened
  paid = -(happened * np.log(chance) + (1 - happened) * np.log(1 - chance))
  print(np.round(paid, 2))
  print(round(np.mean(paid), 2))
---
Chances need a loss of their own: **log loss**, also called **cross-entropy**.

Each respondent is charged minus the log of the chance the model gave to what really happened. For a yes, that's the chance of yes; for a no, the chance of no, `1 - chance`. `np.log`, the logarithm, is 0 for 1 and falls without limit towards 0, so minus it grows.

In the example, a yes given 0.9 costs `0.11`, and a yes given 0.1 costs `2.3`. A chance of 0 for something that happened would cost without limit: sure and wrong is the worst a model can be. The loss is the mean, here `0.88`.

The usual mistake is charging a no with the chance of yes. In the formula, `happened` picks the right half.
