---
id: learn-rng
type: learn
title: Dice you can roll again
concept: probability
dialogue:
  - yahya.proud: "Paul says the warming could be luck. Fine. We'll find out exactly how lucky."
code: |
  import numpy as np

  rng = np.random.default_rng(7)
  print(rng.integers(1, 7, size=5))

  rng = np.random.default_rng(7)
  print(rng.integers(1, 7, size=5))
  print(rng.permutation([1925, 1960, 1995, 2024]))
---
A simulation needs random numbers. NumPy's `np.random.default_rng(seed)` makes a random number generator. `rng.integers(1, 7, size=5)` rolls five dice: whole numbers from 1 up to, but not including, 7. `rng.permutation(values)` gives the values back in a random order, like shuffling a pack of cards.

The **seed** is where the generator's sequence of numbers starts. Two generators made with the same seed deal exactly the same numbers. That makes a simulation repeatable: anyone can run it again and check.

The example rolls `[6 4 5 6 4]` twice, from seed 7, then shuffles four years.

The usual slip is to expect one generator to repeat itself. It moves along its sequence as you use it.
