---
id: learn-frozen
type: learn
title: A frozen copy for the targets
concept: dqn
code: |
  import numpy as np

  params = {"W": np.array([1.0, 2.0])}
  frozen = {name: weights.copy() for name, weights in params.items()}
  same = params                                # a second name, not a copy

  params["W"] -= 0.5                           # one training step
  print(params["W"], frozen["W"], same["W"])
---
The second wobble: the targets come from the network's own Q-values. Every training step moves the guesses, and so moves the targets too. It chases its own tail.

The fix is a **frozen copy** of the network, also called the target network. The targets come from the copy, which holds still while the real network trains. Every so many moves, say 50, the copy catches up with a fresh copy of the weights.

The copy must be a real one: a new array for every weight, with `.copy()`. The example trains one step and prints `[0.5 1.5]`, then the frozen `[1. 2.]`, then `[0.5 1.5]` again for `same`, which was only a second name.

The usual mistake is a second name, or a copy of the dictionary that still shares its arrays.
