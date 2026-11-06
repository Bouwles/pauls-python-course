---
id: learn-pipeline
type: learn
title: Steps that travel together
concept: pipelines
code: |
  import numpy as np
  from sklearn.neighbors import KNeighborsClassifier
  from sklearn.pipeline import make_pipeline
  from sklearn.preprocessing import StandardScaler

  # Cloud (eighths of the sky) and visibility (metres): very different rulers
  X = np.array([[1, 30000], [2, 25000], [7, 26000], [8, 4000]])
  usable = np.array([1, 1, 0, 0])

  model = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=1))
  model.fit(X, usable)
  print(model.predict([[7, 29000]]))
  print(list(model.named_steps))
---
The other kind of leak is quieter. Scaling learns each column's mean and spread. Scale all the rows first, then cross-validate, and every fold's ruler was measured partly on the rows it's scored on.

A **pipeline** fixes it by joining the steps into one model. `make_pipeline(StandardScaler(), KNeighborsClassifier())` is a scaler, then a k-NN. Its `fit` measures the means and spreads, scales, and teaches the k-NN. Its `predict` scales new rows with those same means and spreads, then asks. Cross-validate the pipeline, and it's refitted inside each fold, so the fold being scored never helps measure anything.

Each step is named after its class in lower case, as the example's last line shows.

The usual mistake is scaling everything before cross-validating. Every step that learns anything from the data goes inside the pipeline.
