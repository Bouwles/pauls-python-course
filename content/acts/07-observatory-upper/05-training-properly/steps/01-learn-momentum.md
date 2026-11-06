---
id: learn-momentum
type: learn
title: Gathering speed
concept: optimisers
dialogue:
  - neil.thinking.point: "Same car, same track. Only the driver changes. The driver's called the optimiser."
code: |
  rate, beta = 0.1, 0.9
  plain, w, velocity = 0.0, 0.0, 0.0
  for slope in [-1.0, -1.0, -1.0, -1.0]:     # a slope that keeps pointing the same way
      plain = plain - rate * slope
      velocity = beta * velocity + slope
      w = w - rate * velocity
      print(round(plain, 2), round(w, 3))
---
An **optimiser** is the rule that turns gradients into steps. So far you've used the plainest, often called SGD: move each weight by the learning rate times its gradient.

**Momentum** adds a memory. Picture a ball rolling downhill instead of a careful walker: on a long slope it gathers speed. Each weight keeps a `velocity`, `beta * velocity + slope`, and moves by the rate times the velocity. `beta`, usually 0.9, says how much of the last step to keep.

In the example the slope never changes. Plain steps are all 0.1 long. With momentum each step is longer than the last: after four, it has gone `0.905` against `0.4`.

The usual mistake is thinking momentum forgets each step. It keeps most of every step before it.
