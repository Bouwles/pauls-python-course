---
id: predict-table
type: predict
title: One column is still a table
concept: scikit-learn
code: |
  import numpy as np
  from sklearn.linear_model import LinearRegression

  areas = np.array([116.1, 210.9, 315.9, 137.5, 197.9, 102.2])
  prices = np.array([405000, 732350, 510000, 243000, 338500, 225500])

  model = LinearRegression()
  model.fit(areas, prices)
  print(f"w = {model.coef_[0]:.2f}, b = {model.intercept_:.0f}")
question: What happens?
verify: error
options:
  - text: "It prints the best line: w and b"
    misconception: sklearn-takes-1d-features
    feedback: "scikit-learn always wants `X` as a table: one row per house, one column per feature. Six numbers in a row could be six houses with one feature or one house with six, so it refuses to guess."
  - text: A ValueError
    correct: true
    error: ValueError
    feedback: "Right. `X` must be a table, even with one column. Six numbers in a row could be six houses of one feature or one house of six, and scikit-learn won't guess which."
  - text: "A TypeError: LinearRegression() needs the data in its brackets"
    misconception: estimator-takes-data-at-creation
    error: TypeError
    feedback: "The brackets are for settings, and `LinearRegression` has sensible ones already. The data goes to `fit`. Making a model and teaching it are two separate steps."
after: |
  Run it and read the last lines of the error: scikit-learn says how to mend it. Change `areas` to `areas.reshape(-1, 1)` in the `fit` call and run it again.
---
The six sales from the Quick check on units, fitted with scikit-learn. Look at what `fit` is given.
