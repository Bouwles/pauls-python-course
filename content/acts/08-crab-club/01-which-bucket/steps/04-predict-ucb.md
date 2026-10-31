---
id: predict-ucb
type: predict
title: The benefit of the doubt
concept: exploration-exploitation
code: |
  import math

  names = ["beat the crab", "win a cuddly crab"]
  estimates = [0.17, 0.12]
  counts = [400, 8]
  total = sum(counts)

  scores = []
  for version in range(2):
      bonus = math.sqrt(math.log(total) / counts[version])
      scores.append(estimates[version] + bonus)

  print(names[scores.index(max(scores))])
question: "Beat the crab has the better rate, from 400 visitors. The cuddly crab has had 8. What does this print?"
options:
  - text: beat the crab
    misconception: ucb-picks-best-average
    feedback: "The rates alone would pick Beat the crab. UCB adds a bonus that is big when a version has hardly been tried: about 0.87 for the cuddly crab against 0.12 for Beat the crab. Eight visitors is not enough to rule the cuddly crab out."
  - text: win a cuddly crab
    correct: true
    feedback: "Right. The cuddly crab scores 0.12 + 0.87; Beat the crab 0.17 + 0.12. Eight visitors could easily have been an unlucky eight, so UCB gives it the benefit of the doubt. Each visitor handed it shrinks its bonus, and if it really is worse, Beat the crab takes over again."
  - text: One or the other, at random
    misconception: ucb-is-random
    feedback: "There's no random number anywhere in it. UCB explores on purpose, not by chance: the same estimates and counts always give the same choice."
---
Epsilon-greedy explores blindly: one visitor in ten gets any flyer at all, even one it is sure is hopeless.

**UCB** (upper confidence bound) explores where it is unsure. Each version gets a score: its estimate plus a bonus. The bonus grows slowly with the total number of visitors and shrinks as that version is handed out. It picks the biggest score. A version nobody has been handed yet has no estimate to trust at all, so UCB tries it first.
