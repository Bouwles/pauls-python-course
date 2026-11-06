---
id: predict-baseline
type: predict
title: When every race costs
concept: policy-gradients
code: |
  import numpy as np


  def chances(prefs):
      weights = np.exp(prefs - prefs.max())
      return weights / weights.sum()


  prefs = np.zeros(2)          # a practice tile with two moves: left, right
  ret = -3.0                   # it went right, and the race from here was worth -3
  baseline = -5.0              # races from here are usually worth -5

  for name, score in [("no baseline", ret), ("baseline", ret - baseline)]:
      nudged = prefs + 0.5 * score * (np.array([0.0, 1.0]) - chances(prefs))
      print(name, round(chances(nudged)[1], 2))
question: What does this print?
options:
  - text: |-
      no baseline 0.18
      baseline 0.73
    correct: true
    feedback: "Right. With no baseline, -3 counts as bad, so going right gets less likely, though it was a better race than usual. Taking away the baseline scores it +2: better than usual, so more likely."
  - text: |-
      no baseline 0.82
      baseline 0.73
    misconception: reinforce-always-reinforces
    feedback: "The step is the return times the gradient, and the return is -3. A negative score pushes against the move the crab made: right drops to 0.18."
  - text: |-
      no baseline 0.18
      baseline 0.18
    misconception: baseline-only-shifts
    feedback: "Taking 5 from the score turns -3 into +2, which flips the direction of this step. What a baseline leaves alone is the average over many races, not any single one."
after: |
  Without a baseline, a good race can still make its own moves less likely, only less so than a bad race does. It comes right on average, but every estimate is pulled about by how much races cost overall. A baseline asks the useful question: better or worse than usual from here?
---
A practice tile with two moves, nudged twice from the same start: once with the plain return, once scored against the baseline. Each line prints the chance of going right afterwards.
