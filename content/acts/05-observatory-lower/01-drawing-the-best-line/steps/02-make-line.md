---
id: make-line
type: make
title: The best line, by formula
files: [line.py]
entry: line.py
on_pass: { wendt: "A twelfth of a millimetre for every degree. Brass, behaving exactly like brass." }
hints:
  nudge: "If `predicted` and `actual` are both arrays, what does `predicted - actual` give you? And what does `np.mean` do to that?"
  plan:
    - Predict with a line
    - Measure the miss
    - Fit by formula
    - Show the line, rounded
  shape: |
    def predict(temperatures, w, b):
        return ___ * temperatures + ___


    def mse(predicted, actual):
        return np.mean((___ - ___) ** 2)


    def fit_closed_form(x, y):
        x_mean = np.mean(x)
        y_mean = np.mean(y)
        w = np.sum((x - x_mean) * ___) / np.sum(___ ** 2)
        b = ___ - w * ___
        return w, b
---
A line through the readings is two numbers: the slope `w` and the intercept `b`. For each night it predicts `w * temperature + b`, and its miss is that prediction minus the real focus.

The **mean squared error** squares every miss and takes the mean. Squaring stops misses above and below the line from cancelling out, and makes one big miss cost more than several small ones. The best line is the one with the smallest mean squared error, and for a single feature there's a formula for it:

```text
w = sum((x - mean of x) * (y - mean of y)) / sum((x - mean of x) ** 2)
b = mean of y - w * mean of x
```

Write `predict`, `mse` and `fit_closed_form` in `line.py`, on whole arrays, with no loops. The requirements are at the top of the file; the readings are already loaded at the bottom.
