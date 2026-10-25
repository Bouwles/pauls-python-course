---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "The bait trials, done the new way. One tile, three buckets, no estimates."
  - moss: "Preferences, chances, and a nudge after every run."
code: |
  import numpy as np

  BUCKETS = ["sprats", "mussels", "whelks"]
  GOOD_RUN = [0.30, 0.55, 0.70]        # the sea knows these; the crab doesn't

  rng = np.random.default_rng(1)
  prefs = np.zeros(3)                  # preferences, not estimates
  average = 0.0                        # the baseline: the average reward so far

  for run in range(1, 1001):
      chances = np.exp(prefs - prefs.max())
      chances = chances / chances.sum()
      bucket = rng.choice(3, p=chances)
      reward = 1 if rng.random() < GOOD_RUN[bucket] else 0
      average += (reward - average) / run
      prefs += 0.1 * (reward - average) * (np.eye(3)[bucket] - chances)

  for name, chance in zip(BUCKETS, chances):
      print(f"{name}: {chance:.2f}")
subgoals:
  - label: What the sea knows
    lines: [3, 4]
  - label: Start with no preference, and a baseline
    lines: [6, 8]
  - label: Turn preferences into chances
    lines: [11, 12]
  - label: Pick by chance, and see how it went
    lines: [13, 14]
  - label: Keep the baseline up to date
    lines: [15, 15]
  - label: "Nudge: more likely if better than the baseline"
    lines: [16, 16]
  - label: Report the chances
    lines: [18, 19]
explain:
  prompt: "Line 16 multiplies by `np.eye(3)[bucket] - chances`. Why not just add to the chosen bucket's preference?"
  answer: "That's the gradient of the log of the chosen bucket's chance. It raises the chosen bucket and lowers every bucket in proportion to how likely it already was. Without the minus part, a bucket picked often would be pushed often just for being picked. With it, each bucket moves, on average, by how much better than average it really is."
  concept: policy-gradients
---
Subtracting the biggest preference before `exp` changes nothing about the chances, and stops `exp` overflowing when preferences grow large.

Run it. Sir Reginald ends up taking whelks nearly every time, without ever estimating what a bucket is worth.
