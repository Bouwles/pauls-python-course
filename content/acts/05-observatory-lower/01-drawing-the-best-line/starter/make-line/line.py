"""Penhallow's focus readings, and the best straight line through them.

predict(temperatures, w, b)   the focus the line gives, w * temperature + b,
                              for an array of temperatures (or just one)
mse(predicted, actual)        the mean squared error: the mean of
                              (predicted - actual) ** 2, as one number
fit_closed_form(x, y)         (w, b) for the line with the smallest mean
                              squared error, worked out by the formula

All three work on whole NumPy arrays at once: no loops.

Run as a program, it prints:
By formula: focus = -0.1211 * temperature + 42.318
Mean squared error: 0.0026
"""
# Copied by Professor Wendt from the inside cover of the focus notebook:
# Thirty nights, one line. I could let the machine find it, but I like
# to know where an answer came from. The machine never asks. That is
# the part that worries me. A.P.

import numpy as np


def predict(temperatures, w, b):
    ...


def mse(predicted, actual):
    ...


def fit_closed_form(x, y):
    ...


if __name__ == "__main__":
    readings = np.loadtxt("focus.csv", delimiter=",", skiprows=1)
    temperatures = readings[:, 1]
    focus = readings[:, 2]

    # Fit by formula

    # Measure the miss

    # Show the line, rounded
