---
id: learn-cv
type: learn
title: Five turns at validation
concept: cross-validation
dialogue:
  - neil.thinking: "One validation pile is one roll of the dice. Roll five times."
code: |
  import numpy as np
  from sklearn.model_selection import cross_val_score
  from sklearn.tree import DecisionTreeClassifier

  # Twelve nights: cloud in eighths of the sky, and 1 if the telescope could be used
  cloud = np.array([[0], [1], [2], [3], [5], [6], [7], [8], [1], [4], [2], [6]])
  clear = np.array([1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0])

  scores = cross_val_score(DecisionTreeClassifier(max_depth=1), cloud, clear, cv=3)
  print(scores)
  print(round(scores.mean(), 2))
---
One validation pile is the luck of the draw: which rows land in it changes the score.

**Cross-validation** gives every row a turn. Cut the training rows into `k` piles, called **folds**. Fit a fresh model on all the folds but one, and score it on the one left out. Do that `k` times, each fold taking its turn, and take the mean.

`cross_val_score(model, X, y, cv=3)` does it all and hands back the scores. `DecisionTreeClassifier` is your loan tree, from scikit-learn, used like `LinearRegression`. In the example the three folds score `0.5`, `0.75` and `0.5`: one split alone could have said either.

It's for choosing. The test set stays locked away.

The usual mistake is thinking one model is scored on every fold. Each fold gets a fresh one.
