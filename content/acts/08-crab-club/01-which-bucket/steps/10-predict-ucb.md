---
id: predict-ucb
type: predict
title: The benefit of the doubt
concept: exploration-exploitation
dialogue:
  - aaesha.thinking: "Eight visitors. That's not evidence. That's a rumour."
code: |
  import math

  names = ["waving crab", "demo race"]
  estimates = [0.17, 0.12]
  counts = [400, 8]
  total = sum(counts)

  scores = []
  for version in range(2):
      bonus = math.sqrt(math.log(total) / counts[version])
      scores.append(estimates[version] + bonus)

  print(names[scores.index(max(scores))])
question: What does this print?
options:
  - text: waving crab
    misconception: ucb-picks-best-average
    feedback: "The rates alone would pick the waving crab. UCB adds a bonus that is big when a version has hardly been tried: about 0.87 for the demo race against 0.12 for the waving crab. Eight visitors is not enough to rule the demo race out."
  - text: demo race
    correct: true
    feedback: "Right. The demo race scores 0.12 + 0.87; the waving crab 0.17 + 0.12. Eight visitors could easily have been an unlucky eight, so UCB gives it the benefit of the doubt. Each visitor shown it shrinks its bonus, and if it really is worse, the waving crab takes over again."
  - text: One or the other, at random
    misconception: ucb-is-random
    feedback: "There's no random number anywhere in it. UCB explores on purpose, not by chance: the same estimates and counts always give the same choice."
---
The waving crab has the better estimate, from 400 visitors. The demo race has been shown to only 8. Work out roughly how big each bonus is before you choose.
