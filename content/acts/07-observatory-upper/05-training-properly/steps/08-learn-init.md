---
id: learn-init
type: learn
title: Where the weights start
concept: weight-initialisation
code: |
  import numpy as np

  rng = np.random.default_rng(0)
  for n_in in [4, 100]:
      readings = rng.normal(0, 1, (1000, n_in))
      plain = readings @ rng.normal(0, 1, (n_in, 1))
      scaled = readings @ rng.normal(0, np.sqrt(1 / n_in), (n_in, 1))
      print(n_in, round(plain.std(), 1), round(scaled.std(), 1))
---
Where the weights start decides whether a network can learn at all.

**Start them different.** Hidden neurons with the same starting weights work out the same thing, get the same blame and take the same step, every step. They never come apart, so all but one are wasted. Small random weights break the tie.

**Start them the right size.** A neuron adds up one product per input, and the spread of a sum grows like the square root of how many things are in it. In the example, with 100 inputs the sums spread about `9.7` wide, enough to flatten a sigmoid. A spread of `np.sqrt(1 / n_in)` keeps them near `1.0`. A ReLU layer zeroes about half its inputs, so it uses `np.sqrt(2 / n_in)`.

The usual mistake is starting every weight at 0. Biases can start there; weights can't.
