---
id: the-claim
type: learn
title: The claim
concept: double-descent
code: |
  import numpy as np

  rng = np.random.default_rng(0)
  X_train, X_test = rng.normal(size=(40, 10)), rng.normal(size=(400, 10))
  y_train = np.tanh(X_train.sum(axis=1) / 3) + rng.normal(0, 0.2, 40)
  y_test = np.tanh(X_test.sum(axis=1) / 3)

  for width in [10, 40, 400]:
      W = rng.normal(size=(10, width)) / np.sqrt(10)            # fixed random weights, never trained
      train_f, test_f = np.maximum(0, X_train @ W), np.maximum(0, X_test @ W)
      weights = np.linalg.pinv(train_f) @ y_train               # only the last layer is fitted
      train_error = np.mean((train_f @ weights - y_train) ** 2)
      test_error = np.mean((test_f @ weights - y_test) ** 2)
      print(width, round(train_error, 3), round(test_error, 3))
dialogue:
  - paul.thinking.point: "You drew the U with exam marks in the Model Room. This is what happens off its right-hand edge."
---
In the Exam Score Model, the test error made a U: too stiff, about right, then too flexible, chasing the noise.

The paper looks further right. Give a model more parameters than training examples, and it can fit every example exactly, in endless ways. Choose the fit with the smallest weights, and the test error, the paper says, comes down again: a second descent, **double descent**. The worst place is the **interpolation threshold**, where the parameters only just match the examples.

The model is **random features**: the inputs are mixed by fixed random weights, never trained, and passed through ReLU; only the last layer is fitted. The example has 40 training examples. At 10 features it can't fit them; at 40 it fits exactly, and the test error is `18.636`; at 400 it fits exactly and the test error is back down to `0.157`.
