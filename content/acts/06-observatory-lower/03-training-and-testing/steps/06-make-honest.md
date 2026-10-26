---
id: make-honest
type: make
title: Tested honestly
files: [exam_scores.py]
entry: exam_scores.py
starter_from: make-model
on_pass: { wendt: "Out by one and a third marks on students it had never seen. Guessing the average is out by over three. That I believe." }
hints:
  nudge: "Which pile does each step get to look at? Which pile should be looked at only once, at the very end?"
  plan:
    - Lock the test students away
    - Keep some back for validation
    - Scale each column, with the training students' ruler
    - Fit on training, score on validation, for every degree
    - Choose by validation
    - Open the test students, once
  shape: |
    def train_test_split(X, y, test_fraction, rng):
        order = rng.permutation(___)
        test_count = round(len(X) * ___)
        test, train = order[:___], order[___:]
        return X[train], X[test], y[train], y[test]


    def with_powers(X, degree):
        absences = X[:, ___]
        powers = [absences ** power for power in range(___, degree + 1)]
        return np.column_stack([X] + powers)
---
Three piles now: lock a fifth of the students away for testing, keep a quarter of the rest for validation, learn from the training students, choose by validation, and open the test students once. Add these to `exam_scores.py`:

```text
train_test_split(X, y, test_fraction, rng)  shuffle with order = rng.permutation(len(X));
        the first round(len(X) * test_fraction) rows are the test rows
with_powers(X, degree)  X with absences ** 2 up to ** degree as extra columns
validation_curve(X_train, y_train, X_val, y_val, degrees)  for each degree: add
        the powers, scale by the training rows, fit by least squares, keep both errors
choose_degree(X_train, y_train, X_val, y_val, degrees)  lowest validation error
```

Split with `rng = np.random.default_rng(178)`, test first. Print the pile sizes, the weights learnt from the training students, the table for degrees 1 to 8, the chosen degree, the test error and guessing the average as root mean squared errors in marks, then the new student by the chosen model:

```text
Learning from 214 students, choosing with 72, testing with 71
Chosen degree: 2
Test error: 1.29 marks
Guessing the average: 3.32 marks
```
