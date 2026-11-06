---
id: learn-sklearn
type: learn
title: The library way
concept: scikit-learn
dialogue:
  - yahya.neutral: "Everything you've written today is three lines of scikit-learn."
  - paul.unimpressed: "And now you can mend those three lines when they break."
code: |
  import numpy as np
  from sklearn.linear_model import LinearRegression

  areas = np.array([100.0, 150.0, 200.0])
  prices = np.array([210000.0, 390000.0, 510000.0])

  model = LinearRegression()
  model.fit(areas.reshape(-1, 1), prices)
  print(round(model.coef_[0]), round(model.intercept_))
  print(model.predict([[120.0]]).round())
---
**scikit-learn** is a library with most of this Act's models in it. Every model is used in the same three steps:

1. Make it: `model = LinearRegression()`.
2. Fit it: `model.fit(X, y)` chooses its dials from the examples.
3. Use it: `model.predict(X)` gives one guess per row of `X`.

`X` is what the model is given, its **features**. It's always a table, one row per house and one column per feature, even with only one column: `areas.reshape(-1, 1)` makes that table. `y` is the answers.

What `fit` learns has a name ending in an underscore: `coef_` holds `w`, and `intercept_` holds `b`. The example prints `3000 -80000`, the formula's line, then its guess for 120 square metres.

The usual mistake is passing a plain row of numbers as `X`.
