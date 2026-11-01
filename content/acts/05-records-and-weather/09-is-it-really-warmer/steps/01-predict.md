---
id: predict
type: predict
title: The same dice twice
concept: probability
dialogue:
  - aaesha.thinking: "Anything I simulate, someone else must be able to run again and get the same answer."
code: |
  import numpy as np

  rng = np.random.default_rng(42)
  first = rng.integers(1, 7, size=5)

  rng = np.random.default_rng(42)
  second = rng.integers(1, 7, size=5)
  third = rng.integers(1, 7, size=5)

  print((first == second).all(), (first == third).all())
question: What does this print?
options:
  - text: "True False"
    correct: true
    feedback: "Right. A generator made with seed 42 always deals the same sequence, so `second` matches `first`. But it moves along the sequence as you use it: `third` is the next five rolls, not the first five again."
  - text: "True True"
    misconception: seeded-generator-repeats
    feedback: "The seed fixes the whole sequence, not each call. `second` and `third` come from one generator, so `third` is the next five numbers along."
  - text: "False False"
    misconception: seed-changes-nothing
    feedback: "That's what happens without a seed. Two generators made with the same seed deal exactly the same numbers, which is what makes a simulation repeatable."
after: |
  Run it, then print all three arrays. Change one seed to 43 and run it again.
---
NumPy's `np.random.default_rng(seed)` makes a random number generator. `rng.integers(1, 7, size=5)` rolls five dice: whole numbers from 1 up to, but not including, 7.

The **seed** is where its sequence of numbers starts.
