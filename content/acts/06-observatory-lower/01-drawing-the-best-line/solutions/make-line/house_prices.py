"""House Price Predictor: the best straight line through a year of house sales.

predict(areas, w, b)       the price the line gives, w * area + b, for an
                           array of floor areas (or just one)
mse(predicted, actual)     the mean squared error: the mean of
                           (predicted - actual) ** 2, as one number
fit_closed_form(x, y)      (w, b) for the line with the smallest mean
                           squared error, worked out by the formula

All three work on whole NumPy arrays at once: no loops.

Run as a program, it prints:
By formula: w = 3515.36, b = -140390
Root mean squared error: $288,893
"""
# Copied by Professor Wendt from the flyleaf of Penhallow's statistics book:
# Least squares by hand, on the back of an envelope, twice. I could let
# the machine find the line, but I like to know where an answer came
# from. The machine never asks. That is the part that worries me. A.P.

import numpy as np
import pandas as pd


def predict(areas, w, b):
    return w * areas + b


def mse(predicted, actual):
    return np.mean((predicted - actual) ** 2)


def fit_closed_form(x, y):
    x_mean = np.mean(x)
    y_mean = np.mean(y)
    w = np.sum((x - x_mean) * (y - y_mean)) / np.sum((x - x_mean) ** 2)
    b = y_mean - w * x_mean
    return w, b


if __name__ == "__main__":
    houses = pd.read_csv("king_county_houses.csv")
    areas = houses["area_m2"].to_numpy(dtype=float)
    prices = houses["price"].to_numpy(dtype=float)

    # Fit by formula
    w, b = fit_closed_form(areas, prices)

    # Measure the miss, in dollars
    error = np.sqrt(mse(predict(areas, w, b), prices))

    # Show the line, rounded
    print(f"By formula: w = {w:.2f}, b = {b:.0f}")
    print(f"Root mean squared error: ${error:,.0f}")
