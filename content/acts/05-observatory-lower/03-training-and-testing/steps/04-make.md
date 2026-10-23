---
id: make
type: make
title: Make the honest curve
files: [mirror.py]
entry: mirror.py
on_pass: { wendt: "Degree three, and a test error I actually believe. That's rarer than a clear night." }
hints:
  nudge: "Which pile does each step get to look at? Which pile should be looked at only once, at the very end?"
  plan:
    - Lock the test readings away
    - Keep some back for validation
    - Fit on training, score on validation, for every degree
    - Choose by validation
    - Open the test readings, once
  shape: |
    def train_test_split(x, y, test_fraction, rng):
        order = rng.permutation(___)
        test_count = round(len(x) * ___)
        test, train = order[:___], order[___:]
        return x[train], x[test], y[train], y[test]


    def polynomial_features(x, degree):
        return np.column_stack([x ** power for power in range(___)])


    def predict_polynomial(x, weights):
        return polynomial_features(x, ___) @ weights
---
Now properly, with all sixty readings. The requirements are at the top of `mirror.py`.

Three piles, not two. Lock a fifth of the readings away as the **test** set, and don't look. Split the rest into training and validation. Fit every degree on training, choose by validation, and only then open the test readings, once. The validation error flatters the degree it chose, because it was chosen for doing well there; the test error is the honest one.

```text
degree  training  validation
     1     0.553       0.475
   ...
Chosen degree: 3
Test error: 0.121
Guessing the average: 1.633
```

Follow the split in the requirements exactly, `rng.permutation` and all, and your table will match. The hidden checks split readings of their own, and make sure the chosen curve beats guessing the average.
