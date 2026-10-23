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


def load_nights(path):
    readings = np.loadtxt(path, delimiter=",", skiprows=1)
    return readings[:, 1:6], readings[:, 6]


def fit_scaler(X):
    return X.mean(axis=0), X.std(axis=0)


def scale(X, means, spreads):
    return (X - means) / spreads


def predict(X, w, b):
    return X @ w + b


def gradients(X, y, w, b):
    miss = predict(X, w, b) - y
    dw = 2 * X.T @ miss / len(y)
    db = 2 * np.mean(miss)
    return dw, db


def gradient_descent(X, y, rate, steps):
    # Start from a guess
    w = np.zeros(X.shape[1])
    b = 0.0
    losses = []
    for step in range(steps):
        losses.append(np.mean((predict(X, w, b) - y) ** 2))
        # Slopes for every weight at once
        dw, db = gradients(X, y, w, b)
        # Step downhill
        w = w - rate * dw
        b = b - rate * db
    return w, b, losses


def fit_closed_form(X, y):
    with_ones = np.column_stack([X, np.ones(len(X))])
    solution = np.linalg.lstsq(with_ones, y, rcond=None)[0]
    return solution[:-1], solution[-1]


if __name__ == "__main__":
    X, y = load_nights("nights.csv")

    # Scale each column
    means, spreads = fit_scaler(X)
    X_scaled = scale(X, means, spreads)

    # Walk downhill
    w, b, losses = gradient_descent(X_scaled, y, rate=0.1, steps=500)
    for name, weight in zip(FEATURES, w):
        print(f"{name:<12} {weight:+.2f}")

    # Check against least squares
    exact_w, exact_b = fit_closed_form(X_scaled, y)
    agrees = np.allclose(w, exact_w, atol=1e-3) and abs(b - exact_b) < 1e-3
    print(f"Least squares agrees: {agrees}")

    # Scale new readings the same way
    tonight = scale(np.array([TONIGHT]), means, spreads)
    low = predict(tonight, w, b)[0]
    print(f"Tonight's low: {low:.1f} degrees")
