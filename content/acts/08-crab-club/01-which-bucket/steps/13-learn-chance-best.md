---
id: learn-chance-best
type: learn
title: How sure is the winner?
concept: exploration-exploitation
code: |
  import numpy as np

  rng = np.random.default_rng(1)
  wins = np.array([60, 14])        # waving crab, demo race
  losses = np.array([300, 86])
  samples = rng.beta(wins + 1, losses + 1, size=(10000, 2))
  best = np.argmax(samples, axis=1)
  print(np.bincount(best, minlength=2) / 10000)
---
At the end, Caitlin wants a winner, and how sure to be of it. Draw thousands of plausible rates for every screen, and count how often each comes out on top. That share is its chance of really being the best.

With `size=(10000, 2)`, `rng.beta` draws a table: a row per draw, a column per screen. `np.argmax(samples, axis=1)` gives each row's winning column. `np.bincount(best, minlength=2)` counts how often each column number turns up, with a 0 for a screen that never won. Divide by the draws.

The example prints `[0.7148 0.2852]`. The waving crab is ahead, but the demo race has had only 100 visitors, so it can't be ruled out.

The usual mistake is `axis=0`, which finds the best row in each column.
