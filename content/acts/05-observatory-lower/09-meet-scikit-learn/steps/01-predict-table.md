---
id: predict-table
type: predict
title: One column is still a table
concept: scikit-learn
dialogue:
  - wendt: "Penhallow's shelf. Every model you've built this winter, already written, in one library."
  - pip: "So we could have skipped the winter."
  - moss: "You'd be holding a tool you couldn't mend."
code: |
  import numpy as np
  from sklearn.linear_model import LinearRegression

  temperatures = np.array([-0.8, 5.5, 7.2, 12.8, 3.3, 10.4])
  focus = np.array([42.45, 41.64, 41.41, 40.77, 41.93, 41.02])

  model = LinearRegression()
  model.fit(temperatures, focus)
  print(f"w = {model.coef_[0]:.4f}, b = {model.intercept_:.3f}")
question: What happens?
verify: error
options:
  - text: "It prints the best line: w and b"
    misconception: sklearn-takes-1d-features
    feedback: "scikit-learn always wants `X` as a table: one row per night, one column per reading. A 1-D array of six numbers could be six nights of one reading or one night of six, so it refuses to guess."
  - text: A ValueError
    correct: true
    error: ValueError
    feedback: "Right. `X` must be a table, even with one column. Six numbers in a row could be six nights of one reading or one night of six readings, and scikit-learn won't guess which."
  - text: "A TypeError: LinearRegression() needs the readings in its brackets"
    misconception: estimator-takes-data-at-creation
    error: TypeError
    feedback: "The brackets are for settings, and `LinearRegression` has sensible ones already. The readings go to `fit`. Making a model and teaching it are two separate steps."
after: |
  Run it and read the last lines of the error: scikit-learn says how to mend it. Change `temperatures` to `temperatures.reshape(-1, 1)` in the `fit` call and run it again. Your formula gave the same line in Drawing the Best Line, from thirty nights instead of six.
---
**scikit-learn** is the library almost everyone uses for the models in this Act. Each model is a class. You make one, `LinearRegression()`, then teach it with `fit(X, y)`: `X` holds the readings, `y` the answers.

Here are six of Penhallow's focus nights again.
