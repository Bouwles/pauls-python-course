---
id: make-line
type: make
title: The best line, by formula
files: [house_prices.py]
entry: house_prices.py
on_pass: { paul.pleased: "Three and a half thousand dollars a square metre. Seattle, behaving exactly like Seattle." }
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
Now all 1,000 sales. Write three functions in `house_prices.py`, each on whole arrays with no loops, as in the examples so far:

- `predict(areas, w, b)`: the line's guess for each area
- `mse(predicted, actual)`: the mean squared error, as one number
- `fit_closed_form(x, y)`: the best `w` and `b`, by the formula

The sales are loaded at the bottom of the file. Under the comments there, fit the line, then print it and its root mean squared error, in dollars:

```text
By formula: w = 3515.36, b = -140390
Root mean squared error: $288,893
```

`{error:,.0f}` in an f-string puts commas in a big number. The checks try each function on small arrays first, then look for those two lines.
