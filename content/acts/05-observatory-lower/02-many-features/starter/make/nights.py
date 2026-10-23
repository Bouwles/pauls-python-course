"""Penhallow's evening readings, and the night's lowest temperature.

FEATURES                    the five evening readings, in column order
load_nights(path)           (X, y): X is an (n, 5) array of the evening
                            readings, y the overnight lows
fit_scaler(X)               (means, spreads): each column's mean, and its
                            standard deviation as X.std(axis=0) gives it
scale(X, means, spreads)    X standardised with those means and spreads
predict(X, w, b)            one prediction per row: X @ w + b
gradients(X, y, w, b)       (dw, db): the slopes of the mean squared error,
                            with one slope in dw for each feature
gradient_descent(X, y, rate, steps)
                            start at w = all zeros, b = 0; take that many
                            steps; return (w, b, losses), where losses holds
                            the loss from before each step
fit_closed_form(X, y)       (w, b) by least squares

Run as a program, it learns from the scaled readings by gradient descent,
checks the answer against least squares, and forecasts TONIGHT:
temperature  +2.79
pressure     -0.61
humidity     +0.39
wind         +0.48
cloud        +0.97
Least squares agrees: True
Tonight's low: -0.1 degrees
"""
import numpy as np

FEATURES = ["temperature", "pressure", "humidity", "wind", "cloud"]
TONIGHT = [5.0, 1029.0, 62.0, 3.0, 0.0]


if __name__ == "__main__":
    X, y = load_nights("nights.csv")

    # Scale each column

    # Walk downhill

    # Check against least squares

    # Scale new readings the same way
