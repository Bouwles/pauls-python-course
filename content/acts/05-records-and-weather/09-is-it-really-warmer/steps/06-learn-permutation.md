---
id: learn-permutation
type: learn
title: Could luck have done it?
concept: permutation-tests
code: |
  import numpy as np

  before = np.array([10.8, 11.1, 10.9, 11.2])
  after = np.array([11.6, 11.9, 11.7, 12.0])
  real = after.mean() - before.mean()

  pooled = np.concatenate([before, after])
  rng = np.random.default_rng(3)
  as_big = 0
  for _ in range(1000):
      dealt = rng.permutation(pooled)
      if dealt[4:].mean() - dealt[:4].mean() >= real:
          as_big += 1
  print(round(real, 2))
  print(as_big / 1000)
---
Any two groups of readings have different averages, from luck alone. A **permutation test** asks how often luck makes a difference as big as the real one.

Pretend the labels "before" and "after" don't matter. Pool all the readings with `np.concatenate`, which joins arrays end to end, shuffle them, and deal them back into two groups of the same sizes. Measure the difference. Do it a thousand times. Picture shuffling a pack of numbered cards and dealing two hands, over and over.

The share of shuffles where chance did at least as well is the **p-value**. The example prints `0.8`, then `0.015`: luck managed it fifteen times in a thousand.

The usual slip is to read a small p-value as a big effect. It only says luck rarely does this.
