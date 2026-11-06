---
id: learn-seed
type: learn
title: The same seed, the same run
concept: gymnasium
code: |
  import numpy as np


  class Dice:
      """One roll per step. The same seed, the same rolls."""

      def __init__(self):
          self.rng = np.random.default_rng()

      def reset(self, seed=None, options=None):
          if seed is not None:
              self.rng = np.random.default_rng(seed)
          return 0, {}

      def step(self, action):
          roll = int(self.rng.integers(1, 7))
          return roll, float(roll), True, False, {}


  env = Dice()
  env.reset(seed=5)
  first = [env.step(0)[0] for _ in range(4)]
  env.reset(seed=5)
  again = [env.step(0)[0] for _ in range(4)]
  env.reset()
  more = [env.step(0)[0] for _ in range(4)]
  print(first, again, more)
---
An environment draws its luck from its own random number generator. Gymnasium's rule for seeds makes runs repeatable:

- `reset(seed=5)` makes a fresh generator from the seed.
- `reset()` with no seed keeps the generator it already has, and carries on through its numbers.

So one seed, at the first reset, repeats a whole run of episodes exactly. That's what lets a test replay a run, and two agents face the same luck.

The example prints `[5, 5, 1, 5]` twice, from seed 5, then four new rolls from the same generator.

The usual mistake is making a new unseeded generator at every reset. Then the seed only lasts one episode.
