---
id: make-model
type: make
title: Five columns, five weights
files: [exam_scores.py]
entry: exam_scores.py
on_pass: { paul.pleased: "Twelve point three for our new student. The first term matters most. Well, obviously. Now it's a number." }
hints:
  nudge: "Which function works out the means and spreads, and which one only uses them? Which of the two does the new student need?"
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
The function list is at the top of `exam_scores.py`, and `load_students` is written. Write the rest, as in Paul's open-day example: scale all five columns, learn the five weights at once by gradient descent, check them against `lstsq`, and predict the final grade for `NEW_STUDENT`, scaled with the same ruler.

```text
first_term   +2.81
study_time   -0.02
failures     -0.04
going_out    -0.13
absences     -0.34
Least squares agrees: True
A new student, 12 after the first term: about 12.3 out of 20
```

The weights are per spread of each column, so they can be compared: the biggest moves the guess most. At a rate of 0.1, 500 steps is plenty.

The checks also measure your slopes by nudging each weight, and put other students in `NEW_STUDENT`.
