---
id: worked-boosting
type: worked
title: How Paul would boost
dialogue:
  - paul.unimpressed: "My cycle in to the Clocktower. The windier it is, the longer it takes, and not in a straight line."
  - paul.thinking.think: "One question at a time. Each one only has to fix what the others left."
code: |
  import numpy as np

  # Paul's log: wind in knots, and minutes for the ride in
  wind = np.array([2, 5, 8, 10, 12, 15, 18, 20, 24, 28])
  minutes = np.array([31, 30, 32, 33, 35, 38, 44, 47, 55, 62])


  def fit_stump(x, target):
      """One question about x: (threshold, answer if yes, answer if no)."""
      best = None
      for threshold in (x[:-1] + x[1:]) / 2:
          yes, no = target[x <= threshold], target[x > threshold]
          error = np.sum((yes - yes.mean()) ** 2) + np.sum((no - no.mean()) ** 2)
          if best is None or error < best[0]:
              best = (error, threshold, yes.mean(), no.mean())
      return best[1:]


  def predict_stump(stump, x):
      threshold, if_yes, if_no = stump
      return np.where(x <= threshold, if_yes, if_no)


  start = minutes.mean()
  prediction = np.full(len(minutes), start)
  stumps = []
  for step in range(20):
      leftover = minutes - prediction
      stump = fit_stump(wind, leftover)
      stumps.append(stump)
      prediction = prediction + 0.3 * predict_stump(stump, wind)
      if step in (0, 4, 19):
          print(f"After {step + 1:2} stumps: mean squared error {np.mean((minutes - prediction) ** 2):.2f}")

  at_25 = start + sum(0.3 * predict_stump(stump, np.array([25])) for stump in stumps)
  print(f"At 25 knots: about {at_25[0]:.0f} minutes")
subgoals:
  - label: The log
    lines: [3, 5]
  - label: One small question, a stump
    lines: [8, 21]
  - label: Start from the mean
    lines: [24, 26]
  - label: Find what's left
    lines: [27, 28]
  - label: Fit a small tree to what's left
    lines: [29, 30]
  - label: Add a little of it
    lines: [31, 31]
  - label: Watch the error fall
    lines: [32, 33]
  - label: Predict with the start and every stump
    lines: [35, 36]
explain:
  prompt: "Line 31 adds only 0.3 of each stump's answer. Why not all of it?"
  answer: "Each stump is fitted to the training rides' leftovers, noise and all. Taking a little at a time means no single stump decides much, and later stumps can correct earlier ones. With all of each, boosting chases the noise within a few rounds, gets the training rides exactly right, and does worse on new ones."
  concept: ensembles
---
A forest grows its trees side by side, independently. **Gradient boosting** grows them one after another, each learning from the last.

It starts with the dullest forecast there is, the mean. Then, round after round, it works out what's left over, `minutes - prediction`, fits a small tree to those leftovers, and adds a little of that tree's answer, scaled by a **learning rate**. Each new tree only has to fix what the trees before it still get wrong.

The trees here are **stumps**: one question each. Small trees and a small rate make boosting slow and careful, which is the point. The name comes from the first job: the leftovers are the downhill direction of the squared error, so each round is a step of gradient descent.
