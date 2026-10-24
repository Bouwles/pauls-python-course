---
id: investigate
type: investigate
title: Three verbs
concept: scikit-learn
code: |
  import numpy as np
  from sklearn.linear_model import LinearRegression

  readings = np.loadtxt("focus.csv", delimiter=",", skiprows=1)
  temperatures = readings[:, [1]]     # a table: 30 rows, 1 column
  focus = readings[:, 2]

  model = LinearRegression()
  model.fit(temperatures, focus)
  print(f"w = {model.coef_[0]:.4f}, b = {model.intercept_:.3f}")

  tonight = np.array([[4.0], [9.5]])
  print("Settings:", np.round(model.predict(tonight), 2))
tasks:
  - id: same-line
    prompt: "Run it. What setting does it give for 9.5 degrees?"
    kind: answer
    accept: ["41.17", "41.17 mm"]
    feedback: "41.17, the number one of the checks wanted in Drawing the Best Line. `LinearRegression` solves the same least squares problem as your formula. It just doesn't show its working."
    wrong: "It's the second number on the last line."
  - id: tonight-shape
    prompt: "`temperatures` has shape `(30, 1)`. What shape is `tonight`?"
    kind: answer
    accept: ["(2, 1)", "2, 1", "2 by 1", "(2,1)"]
    feedback: "Two evenings, one reading each. `predict` wants the same kind of table `fit` was given: one row per evening, one column per reading."
    wrong: "Count the evenings, then the readings in each."
  - id: swap-model
    prompt: "Swap the model for `KNeighborsRegressor(n_neighbors=5)`, from `sklearn.neighbors`. It has no `w` or `b`, so delete the line that prints them. Change nothing else, and run it."
    kind: run
    tests: |
      TESTS = [
          output("Five neighbours' settings", expect="Settings: [41.78 41.15]", match="contains"),
          structure("Uses k-NN", calls=["KNeighborsRegressor"], message="Make the model with KNeighborsRegressor(n_neighbors=5)."),
      ]
    solution: |
      import numpy as np
      from sklearn.neighbors import KNeighborsRegressor

      readings = np.loadtxt("focus.csv", delimiter=",", skiprows=1)
      temperatures = readings[:, [1]]     # a table: 30 rows, 1 column
      focus = readings[:, 2]

      model = KNeighborsRegressor(n_neighbors=5)
      model.fit(temperatures, focus)

      tonight = np.array([[4.0], [9.5]])
      print("Settings:", np.round(model.predict(tonight), 2))
---
Every model in scikit-learn is used the same way, which is the library's whole trick:

- make it, with its settings in the brackets: `LinearRegression()`, `KNeighborsClassifier(n_neighbors=15)`
- `model.fit(X, y)` learns from readings and answers
- `model.predict(X)` answers new readings, one answer per row
- `model.score(X, y)` measures it: accuracy for a classifier

Whatever a model learns ends in an underscore, like `coef_` and `intercept_`. No underscore means you set it; an underscore means `fit` did.

`readings[:, [1]]` keeps column 1 as a table. `readings[:, 1]` would flatten it into a row of numbers.
