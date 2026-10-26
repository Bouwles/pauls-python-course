---
id: predict-paper
type: predict
title: Your turn, on paper
concept: backpropagation
dialogue:
  - wendt: "Same chain, but the target is 4 now. Paper and pencil. Then we measure."
code: |
  def loss(w1, x=2.0, w2=3.0, target=4.0):
      h = w1 * x
      a = max(h, 0.0)
      y = w2 * a
      return (y - target) ** 2


  # Measure the slope: nudge w1 a hair each way
  step = 1e-6
  slope = (loss(0.5 + step) - loss(0.5 - step)) / (2 * step)
  print(round(slope, 3))
question: "Work out `dL/dw1` at `w1 = 0.5` on paper, the backward way. What does the measurement print?"
kind: typed
accept: ["-12.0", "-12", "-12.000"]
after: |
  The minus sign is the point: `y` is 3 and the target is 4, so the loss falls as `w1` rises. Gradient descent turns `w1` up.
---
This code doesn't use a backward pass at all. It nudges `w1` a hair up and a hair down and measures how far the loss moves: the **numerical gradient** from Slopes on the Hill.

The measurement is slow, one nudge per weight, but it can't get the chain rule wrong. So it's how you find out whether you did.
