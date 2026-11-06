---
id: worked-pipelines
type: worked
title: How Paul would choose
dialogue:
  - caitlin.laughing: "Some open days the coffee's gone by noon. Some, there's a full pot left at four."
  - paul.thinking: "Visitors, rain and temperature. Let's see if it can tell which Saturday is which."
code: |
  import numpy as np
  from sklearn.model_selection import GridSearchCV, cross_val_score, train_test_split
  from sklearn.neighbors import KNeighborsClassifier
  from sklearn.pipeline import make_pipeline
  from sklearn.preprocessing import StandardScaler

  # Open days: visitors, rain (mm), temperature, coffee gone by noon
  saturdays = np.loadtxt("saturdays.csv", delimiter=",", skiprows=1)
  X = saturdays[:, 1:4]
  ran_out = saturdays[:, 4].astype(int)

  X_train, X_test, y_train, y_test = train_test_split(
      X, ran_out, test_size=0.25, random_state=1, stratify=ran_out)

  model = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))

  scores = cross_val_score(model, X_train, y_train, cv=5)
  print("Five folds:", np.round(scores, 2))
  print(f"Mean: {scores.mean():.3f}")

  grid = {"kneighborsclassifier__n_neighbors": [1, 3, 5, 9, 15]}
  search = GridSearchCV(model, grid, cv=5)
  search.fit(X_train, y_train)
  print("Best:", search.best_params_, f"{search.best_score_:.3f}")

  print(f"Test accuracy, once: {search.score(X_test, y_test):.3f}")
subgoals:
  - label: Load the readings
    lines: [7, 10]
  - label: Lock the test set away
    lines: [12, 13]
  - label: Build the pipeline
    lines: [15, 15]
  - label: Cross-validate on training only
    lines: [17, 19]
  - label: Search the settings
    lines: [21, 24]
  - label: Test once
    lines: [26, 26]
explain:
  prompt: "Why is the scaler inside the pipeline, rather than run on all of `X` before anything else?"
  answer: "In each fold, the whole pipeline is fitted on four fifths of the training Saturdays and scored on the fifth, so the fifth is scaled with means and spreads measured without it, exactly as a new Saturday will be. Scaled beforehand, every fold's ruler would be measured partly on the Saturdays it's scored on."
  concept: pipelines
---
Paul puts the last four ideas together on the open days: can it tell which Saturdays the coffee runs out by noon?

`train_test_split` is your split from the Exam Score Model, from the library. `stratify` keeps the share of sold-out days the same in both parts. Then a pipeline, cross-validated on the training Saturdays only, a grid search over the neighbours, and one look at the test set at the end.

Look how much the five folds disagree. The labels beside the code are Paul's steps, and your Build uses them.
