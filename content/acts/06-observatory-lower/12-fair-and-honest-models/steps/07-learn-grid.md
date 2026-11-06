---
id: learn-grid
type: learn
title: Trying every setting
concept: grid-search
code: |
  import numpy as np
  from sklearn.model_selection import GridSearchCV
  from sklearn.tree import DecisionTreeClassifier

  cloud = np.array([[0], [1], [2], [3], [5], [6], [7], [8], [1], [4], [2], [6]])
  clear = np.array([1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0])

  search = GridSearchCV(DecisionTreeClassifier(random_state=0), {"max_depth": [1, 2, 3]}, cv=3)
  search.fit(cloud, clear)
  print(search.best_params_, round(search.best_score_, 2))
  print(search.predict([[1], [7]]))
---
Choosing a setting, like `k` or a tree's depth, means cross-validating each value and keeping the best. **Grid search** does it for you. `GridSearchCV(model, grid, cv=3)` takes a dictionary of settings to try, the grid, and cross-validates every one.

After `fit`, `best_params_` holds the winner and `best_score_` its mean score. Then it fits the winner once more, on all the rows, so the search itself can `predict`. In the example, a depth of 3 wins.

Inside a pipeline, a setting is named for its step, two underscores, then the setting: `kneighborsclassifier__n_neighbors`.

The usual mistake is reporting `best_score_` as how good the model is. It was chosen for being the highest of several, so it flatters. The honest number comes from the test set.
