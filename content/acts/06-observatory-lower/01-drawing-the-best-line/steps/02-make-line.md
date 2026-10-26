---
id: make-line
type: make
title: The best line, by formula
files: [house_prices.py]
entry: house_prices.py
on_pass: { wendt: "Three and a half thousand dollars a square metre. Seattle, behaving exactly like Seattle." }
hints:
  nudge: "If `predicted` and `actual` are both arrays, what does `predicted - actual` give you? And what does `np.mean` do to that?"
  plan:
    - Predict with a line
    - Measure the miss
    - Fit by formula
    - Show the line, rounded
  shape: |
    def predict(areas, w, b):
        return ___ * areas + ___


    def mse(predicted, actual):
        return np.mean((___ - ___) ** 2)


    def fit_closed_form(x, y):
        x_mean = np.mean(x)
        y_mean = np.mean(y)
        w = np.sum((x - x_mean) * ___) / np.sum(___ ** 2)
        b = ___ - w * ___
        return w, b
---
A line through the sales is two numbers: the slope `w`, dollars per square metre, and the intercept `b`. For each house it predicts `w * area + b`, and its miss is that prediction minus the real price.

The **mean squared error** squares every miss and takes the mean. Squaring stops misses above and below the line cancelling out, and makes one big miss cost more than several small ones. The best line has the smallest mean squared error, and for one feature there's a formula for it:

```text
w = sum((x - mean of x) * (y - mean of y)) / sum((x - mean of x) ** 2)
b = mean of y - w * mean of x
```

The error is in dollars squared, which nobody can picture. Its square root, the **root mean squared error**, is back in dollars: roughly how far off a typical price is.

Write the three functions in `house_prices.py`, on whole arrays, with no loops. The sales are loaded at the bottom.
