---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "The prize shelf, done the new way. One choice, three prizes, no estimates."
  - paul: "Preferences, chances, and a nudge after every game."
code: |
  import numpy as np

  PRIZES = ["a keyring", "a sticker", "a cuddly crab"]
  COMES_BACK = [0.30, 0.55, 0.70]      # the players know these; the shelf doesn't

  rng = np.random.default_rng(1)
  prefs = np.zeros(3)                  # preferences, not estimates
  average = 0.0                        # the baseline: the average reward so far

  for game in range(1, 1001):
      chances = np.exp(prefs - prefs.max())
      chances = chances / chances.sum()
      prize = rng.choice(3, p=chances)
      reward = 1 if rng.random() < COMES_BACK[prize] else 0
      average += (reward - average) / game
      prefs += 0.1 * (reward - average) * (np.eye(3)[prize] - chances)

  for name, chance in zip(PRIZES, chances):
      print(f"{name}: {chance:.2f}")
subgoals:
  - label: What the players know
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
  prompt: "Line 16 multiplies by `np.eye(3)[prize] - chances`. Why not just add to the chosen prize's preference?"
  answer: "That's the gradient of the log of the chosen prize's chance. It raises the chosen prize and lowers every prize in proportion to how likely it already was. Without the minus part, a prize picked often would be pushed often just for being picked. With it, each prize moves, on average, by how much better than average it really is."
  concept: policy-gradients
---
Subtracting the biggest preference before `exp` changes nothing about the chances, and stops `exp` overflowing when preferences grow large.

Run it. The shelf ends up offering the cuddly crab nearly every time, without ever estimating what a prize is worth.
