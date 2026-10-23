"""Penhallow's focus readings, and the best straight line through them.

predict(temperatures, w, b)   the focus the line gives, w * temperature + b,
                              for an array of temperatures (or just one)
mse(predicted, actual)        the mean squared error: the mean of
                              (predicted - actual) ** 2, as one number
fit_closed_form(x, y)         (w, b) for the line with the smallest mean
                              squared error, worked out by the formula
gradients(x, y, w, b)         (dw, db): the slope of the mean squared error
                              in the w direction and in the b direction
gradient_descent(x, y, rate, steps)
                              (w, b, losses): start at w = 0, b = 0, take
                              that many steps downhill, and keep the loss
                              from before each step

Run as a program, it prints:
By formula: focus = -0.1211 * temperature + 42.318
By descent: focus = -0.1211 * temperature + 42.318
Mean squared error: 0.0026
At 4.0 degrees, set the focus to 41.83 mm.
"""
# Copied by Professor Wendt from the inside cover of the focus notebook:
# Thirty nights, one line. I could let the machine find it, but I like
# to know where an answer came from. The machine never asks. That is
# the part that worries me. A.P.

import numpy as np

TONIGHT = 4.0


def predict(temperatures, w, b):
    return w * temperatures + b


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
        # Predict and measure the miss
        losses.append(mse(predict(x, w, b), y))
        # Find the slope of the loss
        dw, db = gradients(x, y, w, b)
        # Step downhill
        w = w - rate * dw
        b = b - rate * db
    return w, b, losses


if __name__ == "__main__":
    readings = np.loadtxt("focus.csv", delimiter=",", skiprows=1)
    temperatures = readings[:, 1]
    focus = readings[:, 2]

    w, b = fit_closed_form(temperatures, focus)
    print(f"By formula: focus = {w:.4f} * temperature + {b:.3f}")

    w, b, losses = gradient_descent(temperatures, focus, rate=0.01, steps=2000)
    print(f"By descent: focus = {w:.4f} * temperature + {b:.3f}")
    print(f"Mean squared error: {losses[-1]:.4f}")

    setting = predict(TONIGHT, w, b)
    print(f"At {TONIGHT} degrees, set the focus to {setting:.2f} mm.")
