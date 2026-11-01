---
id: worked
type: worked
title: Blame, on paper
dialogue:
  - neil.neutral.point: "This much is still on my blackboard. One input, two weights, one answer."
  - neil.thinking.think: "We want to know how the loss changes when each weight changes. Then we know which way to turn it."
language: text
code: |
  The chain:  x -> h = w1 * x -> a = relu(h) -> y = w2 * a -> L = (y - t) ** 2
  x = 2,  w1 = 0.5,  w2 = 3,  target t = 1

  FORWARD
  h = w1 * x          = 0.5 * 2        = 1
  a = relu(h)         = relu(1)        = 1
  y = w2 * a          = 3 * 1          = 3
  L = (y - t) ** 2    = (3 - 1) ** 2   = 4

  BACKWARD
  dL/dy  = 2 * (y - t)                  = 2 * 2    = 4
  dL/da  = dL/dy * w2                   = 4 * 3    = 12
  dL/dh  = dL/da * (1 if h > 0 else 0)  = 12 * 1   = 12

  EACH WEIGHT
  dL/dw2 = dL/dy * a                    = 4 * 1    = 4
  dL/dw1 = dL/dh * x                    = 12 * 2   = 24
subgoals:
  - label: "Forward: work out every value, and keep it"
    lines: [4, 8]
  - label: Start at the loss
    lines: [10, 11]
  - label: Pass the blame back, one link at a time
    lines: [12, 13]
  - label: "A weight's share: the blame arriving, times what went in"
    lines: [15, 17]
explain:
  prompt: "Why does `dL/da` use `w2`, while `dL/dw2` uses `a`?"
  answer: "Because y = w2 * a. Nudge a, and y moves w2 times as much, so the blame reaching a is scaled by w2. Nudge w2, and y moves a times as much, so w2's share is scaled by a. In a product, each side's slope is the other side."
  concept: backpropagation
---
`dL/dy` is the **gradient** of the loss with respect to `y`: how fast the loss changes when `y` is nudged. Here, 4 times as fast.

**Backpropagation** is the chain rule worked backwards. Start at the loss and walk down the chain: each link multiplies the blame arriving by its own local slope. ReLU's slope is 1 where it let the number through and 0 where it cut it. The forward values are kept because the backward pass needs them.

`dL/dw1` is 24: nudge `w1` up and the loss rises 24 times as fast. So gradient descent turns `w1` down.
