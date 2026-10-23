"""Penhallow's mirror readings: how much warmer the mirror is than the air,
so many hours after the dome opens. Which curve fits, honestly?

train_test_split(x, y, test_fraction, rng)
        shuffle the positions with order = rng.permutation(len(x)); the first
        round(len(x) * test_fraction) of them are the test readings and the
        rest are for training. Returns x_train, x_test, y_train, y_test
polynomial_features(x, degree)
        one column per power, x ** 0 up to x ** degree:
        shape (len(x), degree + 1)
fit_polynomial(x, y, degree)
        the weights for that degree, by least squares
predict_polynomial(x, weights)
        one prediction per reading (the degree is len(weights) - 1)
mse(predicted, actual)
        the mean squared error
validation_curve(x_train, y_train, x_val, y_val, degrees)
        (train_errors, val_errors): two lists with one error for each degree,
        every curve fitted on the training readings only
choose_degree(x_train, y_train, x_val, y_val, degrees)
        the degree with the lowest validation error

Run as a program, it uses rng = np.random.default_rng(34) to split off a
fifth of the readings for testing, then a quarter of the rest for
validation. It prints the validation curve for degrees 1 to 10, chooses a
degree, and only then opens the test readings:
degree  training  validation
     1     0.553       0.475
     2     0.140       0.085
   ...
    10     0.064       0.126
Chosen degree: 3
Test error: 0.121
Guessing the average: 1.633
"""
# Copied by Professor Wendt from a card in the bottom drawer of the desk:
# Held back twelve nights the machine had never seen. It got every one
# of them wrong, and was quite sure of itself. I learnt more that
# afternoon than in the whole winter before. The test nights live in
# the bottom drawer now, locked. A.P.

import numpy as np


def train_test_split(x, y, test_fraction, rng):
    order = rng.permutation(len(x))
    test_count = round(len(x) * test_fraction)
    test, train = order[:test_count], order[test_count:]
    return x[train], x[test], y[train], y[test]


def polynomial_features(x, degree):
    return np.column_stack([x ** power for power in range(degree + 1)])


def fit_polynomial(x, y, degree):
    return np.linalg.lstsq(polynomial_features(x, degree), y, rcond=None)[0]


def predict_polynomial(x, weights):
    return polynomial_features(x, len(weights) - 1) @ weights


def mse(predicted, actual):
    return np.mean((predicted - actual) ** 2)


def validation_curve(x_train, y_train, x_val, y_val, degrees):
    train_errors = []
    val_errors = []
    for degree in degrees:
        weights = fit_polynomial(x_train, y_train, degree)
        train_errors.append(mse(predict_polynomial(x_train, weights), y_train))
        val_errors.append(mse(predict_polynomial(x_val, weights), y_val))
    return train_errors, val_errors


def choose_degree(x_train, y_train, x_val, y_val, degrees):
    train_errors, val_errors = validation_curve(x_train, y_train, x_val, y_val, degrees)
    return degrees[int(np.argmin(val_errors))]


if __name__ == "__main__":
    readings = np.loadtxt("cooling.csv", delimiter=",", skiprows=1)
    hours = readings[:, 1]
    difference = readings[:, 2]

    # Lock the test readings away
    rng = np.random.default_rng(34)
    x_rest, x_test, y_rest, y_test = train_test_split(hours, difference, 0.2, rng)

    # Keep some back for validation
    x_train, x_val, y_train, y_val = train_test_split(x_rest, y_rest, 0.25, rng)

    # Fit on training, score on validation, for every degree
    degrees = list(range(1, 11))
    train_errors, val_errors = validation_curve(x_train, y_train, x_val, y_val, degrees)
    print("degree  training  validation")
    for degree, train_error, val_error in zip(degrees, train_errors, val_errors):
        print(f"{degree:6}  {train_error:8.3f}  {val_error:10.3f}")

    # Choose by validation
    degree = choose_degree(x_train, y_train, x_val, y_val, degrees)
    print(f"Chosen degree: {degree}")

    # Open the test readings, once
    weights = fit_polynomial(x_train, y_train, degree)
    test_error = mse(predict_polynomial(x_test, weights), y_test)
    baseline = mse(np.full(len(y_test), np.mean(y_train)), y_test)
    print(f"Test error: {test_error:.3f}")
    print(f"Guessing the average: {baseline:.3f}")
