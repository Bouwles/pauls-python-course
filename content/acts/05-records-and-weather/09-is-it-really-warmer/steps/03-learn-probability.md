---
id: learn-probability
type: learn
title: How often, over many tries
concept: probability
code: |
  import numpy as np

  rng = np.random.default_rng(1)
  rolls = rng.integers(1, 7, size=10_000)
  print((rolls == 6).mean())
---
A **probability** is a number from 0 to 1 that says how often something happens over many tries: 0 never, 1 always, 0.5 half the time. A fair die shows a six with probability one in six, about 0.17.

When a probability is hard to work out, **simulate** it: make the tries happen, many times, and count. The share of tries where it happened is your estimate, and the more tries, the closer it settles to the true chance.

`(rolls == 6).mean()` is the share of rolls that were sixes, because `True` counts as 1. The example rolls ten thousand dice and prints `0.1658`.

The usual slip is to trust a handful of tries. Twenty rolls can easily give six sixes.
