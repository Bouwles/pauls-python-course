---
id: learn-check
type: learn
title: Checking by measuring
concept: numerical-gradient-checking
code: |
  def loss(w1, x=3.0, w2=2.0, t=4.0):
      a = max(w1 * x, 0.0)
      return (w2 * a - t) ** 2


  step = 1e-5
  measured = (loss(1.0 + step) - loss(1.0 - step)) / (2 * step)
  print(round(measured, 4))
---
A backward pass is easy to get slightly wrong, and a wrong one can still make the loss fall. So check it by measuring, as you measured slopes on the park hill.

Nudge one weight a hair up and work out the loss; nudge it a hair down and work it out again. The change, divided by the distance between the two, `2 * step`, is the **numerical gradient**. If it matches backpropagation, backpropagation is right.

The example measures the gradient for `w1` from the last Learn step, with no chain rule at all, and prints `24.0`: the same.

It's far too slow to train with, one nudge per weight, but it can't get the chain rule wrong.

The usual mistake is dividing by `step`. Up and down are two steps apart.
