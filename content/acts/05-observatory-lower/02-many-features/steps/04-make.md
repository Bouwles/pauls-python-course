---
id: make
type: make
title: Make the frost forecast
files: [nights.py]
entry: nights.py
on_pass: { wendt: "Minus nought point one. I'll close the shutter at ten and spare myself the kettle." }
hints:
  nudge: "Which function works out the means and spreads, and which one only uses them? Which of the two does tonight need?"
  plan:
    - Load the readings
    - Scale each column
    - Start from a guess
    - Slopes for every weight at once
    - Step downhill
    - Check against least squares
    - Scale new readings the same way
  shape: |
    def fit_scaler(X):
        return X.mean(axis=___), X.std(axis=___)


    def gradients(X, y, w, b):
        miss = predict(X, w, b) - y
        dw = 2 * ___ @ miss / len(y)
        db = 2 * np.mean(miss)
        return dw, db


    def fit_closed_form(X, y):
        with_ones = np.column_stack([X, np.ones(___)])
        solution = np.linalg.lstsq(with_ones, y, rcond=None)[0]
        return solution[___], solution[___]
---
Now Penhallow's whole notebook. The requirements are at the top of `nights.py`: load the sixty nights, scale them, learn all five weights at once by gradient descent, check them against least squares, and forecast the low for `TONIGHT`.

```text
temperature  +2.79
pressure     -0.61
humidity     +0.39
wind         +0.48
cloud        +0.97
Least squares agrees: True
Tonight's low: -0.1 degrees
```

Each weight is per standard deviation of its reading, so they can be compared fairly: the biggest one moves the forecast most. At a rate of 0.1, 500 steps is plenty.

The hidden checks measure your slopes by nudging each weight, train on readings of their own, and put other evenings in `TONIGHT`.
