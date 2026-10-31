---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "Yahya swears by his new keyboard. Eight Drills on the old, eight on the new. Better, or lucky?"
code: |
  import numpy as np

  old_keyboard = np.array([5, 7, 4, 6, 5, 8, 6, 5])
  new_keyboard = np.array([7, 6, 9, 8, 6, 10, 7, 8])

  real = new_keyboard.mean() - old_keyboard.mean()

  pooled = np.concatenate([old_keyboard, new_keyboard])

  rng = np.random.default_rng(8)
  shuffled_gaps = []
  for _ in range(10_000):
      dealt = rng.permutation(pooled)
      shuffled_gaps.append(dealt[8:].mean() - dealt[:8].mean())

  as_big = np.array(shuffled_gaps) >= real

  p = as_big.mean()
  print(f"Real difference: {real:.2f} points a Drill")
  print(f"Chance did as well in {p:.1%} of shuffles")
subgoals:
  - label: Measure the real difference
    lines: [6, 6]
  - label: Pool the readings, as if the label didn't matter
    lines: [8, 8]
  - label: Shuffle and deal them out again, many times
    lines: [10, 14]
  - label: Count how often chance does as well
    lines: [16, 16]
  - label: The share is the p-value
    lines: [18, 20]
explain:
  prompt: "Why doesn't Paul just check whether the new keyboard's average is bigger, and stop there?"
  answer: "Any two sets of eight Drills have different averages, from luck alone. Shuffling shows how big a difference luck makes when the keyboard doesn't matter at all. Only a real difference that luck rarely matches is worth believing."
  concept: permutation-tests
---
This is a **permutation test**. If the keyboard made no difference, the labels "old" and "new" would be meaningless, and any eight of the sixteen scores could as easily have been the new ones. So Paul deals them out again at random, thousands of times, and sees how often chance alone makes a gap as big as the real one.

That share is the **p-value**. A small one means luck rarely does this well; it doesn't say how much the keyboard helps, or why.
