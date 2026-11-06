---
id: learn-split
type: learn
title: Finding the best question
concept: decision-trees
code: |
  import numpy as np


  def gini(labels):
      shares = np.bincount(labels) / len(labels)
      return 1 - np.sum(shares ** 2)


  ages = np.array([22, 25, 31, 40, 52])
  repaid = np.array([0, 0, 1, 1, 1])

  for threshold in [23.5, 28.0, 35.5]:
      yes = ages <= threshold
      left, right = repaid[yes], repaid[~yes]
      score = (len(left) * gini(left) + len(right) * gini(right)) / len(repaid)
      print(threshold, round(score, 3))
---
To find the best question about one column, try every sensible threshold. The sensible ones sit halfway between neighbouring readings: any other threshold splits the rows the same way as one of those.

For each threshold, rows with a reading at most the threshold go to the yes pile, the rest to the no pile. `~yes` flips every `True` and `False`. The question's score is the two piles' Gini, each weighted by its share of the rows. The lowest score wins, if it beats asking no question at all.

In the example, 28.0 sends both non-payers one way and the three payers the other, so it scores `0.0`.

The usual mistake is adding the two Ginis without weighting them. A pile of one row always scores 0, so plain adding favours splitting off a single odd row.
