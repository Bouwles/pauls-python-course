"""House Price Predictor: the best straight line through a year of house sales.

predict(areas, w, b)       the price the line gives, w * area + b, for an
                           array of floor areas (or just one)
mse(predicted, actual)     the mean squared error: the mean of
                           (predicted - actual) ** 2, as one number
fit_closed_form(x, y)      (w, b) for the line with the smallest mean
                           squared error, worked out by the formula
gradients(x, y, w, b)      (dw, db): the slope of the mean squared error
                           in the w direction and in the b direction
gradient_descent(x, y, rate, steps)
                           (w, b, losses): start at w = 0, b = 0, take
                           that many steps downhill, and keep the loss
                           from before each step

Run as a program, it prints:
By formula: w = 3515.36, b = -140390
By descent: w = 3515.36, b = -140390
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


def gradients(x, y, w, b):
    miss = predict(x, w, b) - y
    dw = 2 * np.mean(miss * x)
    db = 2 * np.mean(miss)
    return dw, db


def gradient_descent(x, y, rate, steps):
    # Start from a guess
    w, b = 0.0, 0.0
    losses = []
    for step in range(steps):
        # Measure the miss, and keep the loss
        losses.append(mse(predict(x, w, b), y))
        # Find the slope of the loss
        dw, db = gradients(x, y, w, b)
        # Step downhill
        w = w - rate * dw
        b = b - rate * db
    return w, b, losses


if __name__ == "__main__":
    houses = pd.read_csv("king_county_houses.csv")
    areas = houses["area_m2"].to_numpy(dtype=float)
    prices = houses["price"].to_numpy(dtype=float)

    # Fit by formula
    w, b = fit_closed_form(areas, prices)
    print(f"By formula: w = {w:.2f}, b = {b:.0f}")

    # Walk downhill, in hundreds of square metres
    w_per_hundred, b, losses = gradient_descent(areas / 100, prices, rate=0.1, steps=2000)
    w = w_per_hundred / 100
    print(f"By descent: w = {w:.2f}, b = {b:.0f}")

    # Measure the miss, in dollars
    error = np.sqrt(mse(predict(areas, w, b), prices))
    print(f"Root mean squared error: ${error:,.0f}")
