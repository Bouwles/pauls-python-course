---
id: learn-backprop
type: learn
title: Passing the blame back
concept: backpropagation
dialogue:
  - neil.thinking.think: "Which weight was to blame, and by how much? Then we know which way to turn each one."
code: |
  # One reading through two weights:  h = w1 * x,  a = relu(h),  y = w2 * a,  loss = (y - t) ** 2
  x, w1, w2, t = 3.0, 1.0, 2.0, 4.0

  h = w1 * x                       # forward, keeping every value
  a = max(h, 0.0)
  y = w2 * a
  loss = (y - t) ** 2

  d_y = 2 * (y - t)                # backward, from the loss
  d_a = d_y * w2
  d_h = d_a * (1.0 if h > 0 else 0.0)
  d_w2 = d_y * a
  d_w1 = d_h * x
  print(loss, d_y, d_a, d_h)
  print(d_w2, d_w1)
---
To walk downhill, a network needs each weight's **gradient**: how fast the loss changes when that weight is nudged. `d_w1` is short for "the gradient for `w1`".

**Backpropagation** works them all out with the chain rule, run backwards. First the forward pass, keeping every value. Then start at the loss and walk back. Each link multiplies the blame arriving by its own slope: `y = w2 * a` passes back `w2` times the blame, and ReLU passes all of it where it let the number through, none where it cut it to 0. A weight's share is the blame arriving times what went in.

The example's `d_w1` is `24.0`: nudge `w1` up and the loss rises 24 times as fast, so turn it down.

The usual mistake is not keeping the forward values. The backward pass needs every one.
