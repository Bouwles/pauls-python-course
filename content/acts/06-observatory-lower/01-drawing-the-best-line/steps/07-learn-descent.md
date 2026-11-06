---
id: learn-descent
type: learn
title: Walking downhill in fog
concept: gradient-descent
code: |
  def loss(x):
      return (x - 3) ** 2 + 1      # a valley, with its bottom at x = 3


  def slope(x):
      return 2 * (x - 3)           # how steep the loss is at x


  x = 0.0
  rate = 0.25
  for step in range(5):
      x = x - rate * slope(x)
      print(step, x, loss(x))
---
Most models have no formula for their best dials. They're fitted another way.

Picture every setting of the dials as a place on a hillside, with the loss as the height there. The best setting is at the bottom. You're in fog: you can't see the bottom, only feel the slope under your feet. So you step downhill, then feel again.

That's **gradient descent**. The gradient is the slope of the loss. Each step does `x = x - rate * slope`. The **learning rate**, `rate`, is how far to step for each unit of slope, and you choose it.

The example walks from 0 towards the bottom at 3. Its steps shrink on their own as the ground flattens.

The usual mistake is adding the slope. The slope points uphill, so you take it away.
