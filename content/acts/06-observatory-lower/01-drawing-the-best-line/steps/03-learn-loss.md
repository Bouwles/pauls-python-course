---
id: learn-loss
type: learn
title: How wrong is it?
concept: mean-squared-error
code: |
  import numpy as np

  guesses = np.array([260, 390, 570, 430])    # the line's prices, in thousands of dollars
  actual = np.array([250, 400, 500, 500])     # what the houses really sold for

  miss = guesses - actual
  print(miss)
  print(np.mean(miss))
  print(np.mean(miss ** 2))
  print(np.sqrt(np.mean(miss ** 2)))
---
To choose the dials, you need a number for how wrong the guesses are: the **loss**. Lower is better, and 0 means every guess was exact.

Each guess has a **miss**: the guess minus the real price. The usual loss is the **mean squared error**: square every miss, then take the mean. Squaring makes every miss positive, and makes one big miss cost more than several small ones.

In the example, two guesses are 70 thousand dollars out, yet the misses average `0.0`. Their mean squared error is `2500.0`, in thousands of dollars squared, which nobody can picture. Its square root, the **root mean squared error**, is `50.0`: roughly how far off a typical guess is, in thousands of dollars.

The usual mistake is averaging the misses without squaring them, so misses above and below cancel out.
