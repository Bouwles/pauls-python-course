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


if __name__ == "__main__":
    readings = np.loadtxt("cooling.csv", delimiter=",", skiprows=1)
    hours = readings[:, 1]
    difference = readings[:, 2]

    # Lock the test readings away

    # Keep some back for validation

    # Fit on training, score on validation, for every degree

    # Choose by validation

    # Open the test readings, once
