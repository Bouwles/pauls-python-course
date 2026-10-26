---
id: make-sklearn
type: make
title: The price of a house
files: [house_prices.py]
entry: house_prices.py
starter_from: make-descent
on_pass: { wendt: "Three methods, one line, to the cent. Now it can price a house, and it knows when not to." }
hints:
  nudge: "What shape does `fit` want `X` to be, and what is the shape of `areas`? Then: what happens when `float()` is handed a word?"
  plan:
    - "fit_sklearn: make the model, fit it on a table of one column, hand back the weight and the intercept"
    - Ask the library, and print its line
    - Measure the miss, in dollars
    - Ask for a floor area, and catch one that isn't a number
    - Price it only if it's inside the sales
  shape: |
    def fit_sklearn(x, y):
        model = ___()
        model.fit(x.___(-1, 1), y)
        return model.___[0], model.___


    try:
        area = float(input("Floor area in square metres? "))
    except ___:
        print("That's not a floor area.")
    else:
        if areas.___() <= area <= areas.___():
            ...
---
Every model in scikit-learn is used the same way: make it, `fit(X, y)`, then `predict(X)`. Whatever it learns ends in an underscore: `coef_` holds the weights, one per column, and `intercept_` is `b`.

Add `fit_sklearn(x, y)` to `house_prices.py`, taking a 1-D array of areas, and print its line under the other two. Then make it a predictor. Ask `Floor area in square metres? ` and print the line's price, to the nearest thousand dollars: `round(price, -3)`.

```text
scikit-learn: w = 3515.36, b = -140390
Root mean squared error: $288,893
Floor area in square metres? 150
A house of 150 square metres: about $387,000
```

A line only knows the houses it was fitted on. Outside the smallest and largest areas in the sales, print `The sales run from 36 to 919 square metres. Outside that, the line is guessing.` instead, and `That's not a floor area.` for anything that isn't a number.
