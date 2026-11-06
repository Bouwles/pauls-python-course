---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral: "Yahya's radiator, from downstairs. Twelve readings to learn from."
code: |
  import numpy as np

  from net import backward, forward, init_params, mse

  # The radiator cooling: hours after the heating went off (centred), degrees above the room
  rng = np.random.default_rng(5)
  hours = rng.uniform(-1.5, 1.5, (30, 1))
  warmth = 4 * np.exp(-hours - 1.5) + rng.normal(0, 0.3, (30, 1))
  X, T = hours[:12], warmth[:12]
  X_val, T_val = hours[12:], warmth[12:]

  params = init_params(1, 32)
  patience = 50
  best_loss, best_epoch, best_params = float("inf"), 0, None
  for epoch in range(5000):
      P, cache = forward(X, params)
      grads = backward(X, T, params, cache)
      for name in params:
          params[name] -= 0.05 * grads[name]
      val_loss = mse(forward(X_val, params)[0], T_val)
      if val_loss < best_loss:
          best_loss, best_epoch = val_loss, epoch
          best_params = {name: value.copy() for name, value in params.items()}
      elif epoch - best_epoch >= patience:
          break

  params = best_params
  print(f"Stopped after epoch {epoch}. Best: epoch {best_epoch}, validation {best_loss:.3f}")
subgoals:
  - label: Readings to learn from, readings to check on
    lines: [5, 10]
  - label: One step downhill
    lines: [16, 19]
  - label: Score it on readings it never learnt from
    lines: [20, 20]
  - label: "A new best: note when, and keep a copy"
    lines: [21, 23]
  - label: "Out of patience: stop"
    lines: [24, 25]
  - label: Put the best weights back
    lines: [27, 27]
explain:
  prompt: "Why wait `patience` epochs, instead of stopping the first time the validation loss goes up?"
  answer: "The validation loss wobbles. One worse epoch is often followed by a better one, especially early on. Patience waits long enough to tell a wobble from the climb, and because the best weights were kept, waiting costs nothing but time."
  concept: regularisation
---
Early stopping on a real network: the one from `net.py`, with one input instead of six, learning the radiator's cooling from twelve readings and checked on eighteen more.

The copy of the weights is a new dict of copied arrays, `value.copy()` for each, because training changes the arrays in place. The labels beside the code are Paul's steps, and your `train` uses them.
