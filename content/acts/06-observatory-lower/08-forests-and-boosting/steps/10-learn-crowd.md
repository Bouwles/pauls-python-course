---
id: learn-crowd
type: learn
title: A panel of guessers
concept: ensembles
dialogue:
  - aaesha.thinking: "Ask three people and average them. Better than asking one, if they don't all think alike."
code: |
  import numpy as np

  truth = 0.7                                  # an applicant's real chance of repaying
  officers = np.array([0.9, 0.5, 0.75])        # three officers, each wrong their own way
  copies = np.array([0.9, 0.9, 0.9])           # one officer, asked three times

  print(round(officers.mean(), 3), round(abs(officers.mean() - truth), 3))
  print(round(copies.mean(), 3), round(abs(copies.mean() - truth), 3))
---
An **ensemble** is a panel of models whose answers are combined: averaged for a number, voted on for a label.

It works when the models are wrong in different ways. One officer guesses too high, another too low, and the misses cancel. In the example, three officers who miss by 0.2, 0.2 and 0.05 average to `0.717`, only `0.017` from the truth.

It does nothing when they're wrong in the same way. Three copies of one officer average to that officer's own guess, `0.9`, still `0.2` out. A copy adds no new information.

So the whole art of an ensemble is making its models differ.

The usual mistake is thinking more models always help. More of the same model is the same model.
