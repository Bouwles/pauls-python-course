---
id: predict-ucb
type: predict
title: The benefit of the doubt
concept: exploration-exploitation
code: |
  import math

  names = ["whelks", "mussels"]
  estimates = [0.60, 0.45]
  counts = [40, 3]
  total = sum(counts)

  scores = []
  for bucket in range(2):
      bonus = math.sqrt(math.log(total) / counts[bucket])
      scores.append(estimates[bucket] + bonus)

  print(names[scores.index(max(scores))])
question: "Whelks have the better average, from 40 runs. Mussels have had 3. What does this print?"
options:
  - text: whelks
    misconception: ucb-picks-best-average
    feedback: "The averages alone would pick whelks. UCB adds a bonus that is big when a bucket has hardly been tried: about 1.12 for mussels against 0.31 for whelks. Three runs is not enough to rule mussels out."
  - text: mussels
    correct: true
    feedback: "Right. Mussels score 0.45 + 1.12; whelks 0.60 + 0.31. Three runs could easily have been unlucky, so UCB gives mussels the benefit of the doubt. Each run on mussels shrinks their bonus, and if they really are worse, whelks take over again."
  - text: Whelks or mussels, at random
    misconception: ucb-is-random
    feedback: "There's no random number anywhere in it. UCB explores on purpose, not by chance: the same estimates and counts always give the same choice."
---
Epsilon-greedy explores blindly: one run in ten on any bucket, even one it is sure is hopeless.

**UCB** (upper confidence bound) explores where it is unsure. Each bucket gets a score: its estimate plus a bonus. The bonus grows slowly with the total number of runs and shrinks as that bucket is tried. It picks the biggest score. A bucket nobody has tried yet has no estimate to trust at all, so UCB tries it first.
