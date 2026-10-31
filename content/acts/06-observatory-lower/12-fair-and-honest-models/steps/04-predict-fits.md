---
id: predict-fits
type: predict
title: How many fittings
concept: grid-search
dialogue:
  - yahya: "Four settings, so four models. Grid search is quick."
code: |
  import numpy as np
  from sklearn.model_selection import GridSearchCV
  from sklearn.neighbors import KNeighborsClassifier

  fits = []


  class CountingNeighbours(KNeighborsClassifier):
      def fit(self, X, y):
          fits.append(self.n_neighbors)
          return super().fit(X, y)


  rng = np.random.default_rng(0)
  X = rng.normal(size=(60, 2))
  y = (X[:, 0] > 0).astype(int)

  search = GridSearchCV(CountingNeighbours(), {"n_neighbors": [1, 5, 9, 15]}, cv=5)
  search.fit(X, y)
  print(len(fits))
question: "`CountingNeighbours` is a k-NN that writes down every time it's fitted. What does this print?"
options:
  - text: "4"
    misconception: grid-search-fits-once-per-setting
    feedback: "Each setting is cross-validated, and five folds means five fittings, each on a different four fifths. Four settings is twenty fittings before it has even chosen."
  - text: "20"
    misconception: grid-search-no-refit
    feedback: "Twenty fittings choose the setting: four settings, five folds each. Then it fits once more, on all the data, with the winning setting, so `search.predict` uses a model that learnt from everything."
  - text: "21"
    correct: true
    feedback: "Right. Four settings times five folds is twenty, to choose; then one more fit of the winner on all the data, which is the model `search` uses from then on."
  - text: "5"
    misconception: folds-share-one-fit
    feedback: "Each fold trains on a different four fifths of the data, so each needs a model of its own. Cross-validation fits as many times as there are folds, for every setting."
after: |
  Run it, then print `fits` itself to see the order they came in, and `search.best_params_`.
---
`GridSearchCV` takes a model and a grid of settings to try, and behaves like a model itself: you `fit` it, and it does the rest.

Count the work it does.
