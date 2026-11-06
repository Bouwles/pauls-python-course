---
id: learn-reproducible
type: learn
title: The same numbers, twice
concept: reproducibility
code: |
  import numpy as np


  def draw(seed):
      rng = np.random.default_rng(seed)
      data = rng.normal(size=3)
      weights = rng.normal(size=2)
      return data.round(2), weights.round(2)


  def draw_weights_first(seed):
      rng = np.random.default_rng(seed)
      weights = rng.normal(size=2)
      data = rng.normal(size=3)
      return data.round(2), weights.round(2)


  print(draw(7))
  print(draw(7))
  print(draw_weights_first(7))
---
A result is **reproducible** when someone else can run the same code and get the same numbers. With random data, that takes two things.

First, one generator, made from a seed, for everything random. The same seed deals the same numbers in the same order.

Second, the same order of drawing. A generator hands out its numbers in turn, so drawing the weights before the data gives each different numbers, even from the same seed. The example draws twice in one order, and the two lines match. Then it swaps the order, and the data comes out as `[-0.27 -0.89 -0.45]` instead.

The brief's order is the agreement. Keep it, and your table matches Paul's to the last digit. Change it, and you've run a different experiment.
