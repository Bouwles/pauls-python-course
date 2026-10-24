"""Double descent, reproduced small. Press Run to run this file.

FEATURES inputs per example, and true_answer(X), the answer the data is made
from, are given.

run_once(width, seed, n_train=40, noise=0.2, n_test=400)
        one trial, giving back (train_error, test_error). Draw everything from
        rng = np.random.default_rng(seed), in this order:
            X_train = rng.normal(size=(n_train, FEATURES))
            y_train = true_answer(X_train) + rng.normal(0, noise, n_train)
            X_test = rng.normal(size=(n_test, FEATURES))
            y_test = true_answer(X_test)
            W = rng.normal(size=(FEATURES, width)) / np.sqrt(FEATURES)
        then fit the smallest-norm weights on the training features, and
        score them on the training and the test examples
descent_curve(widths, seeds, n_train=40, noise=0.2)
        for each width, the median test error over the seeds: a list with
        one number per width
"""
import matplotlib.pyplot as plt
import numpy as np
import pytest

from descent import fit_min_norm, mse, relu_features

FEATURES = 10
WIDTHS = [1, 2, 5, 10, 15, 20, 30, 35, 40, 45, 50, 60, 80, 100, 200, 500, 1000, 2000]
SEEDS = range(10)


def true_answer(X):
    """The answer the data is made from, so we know exactly how wrong a model is."""
    return np.tanh(2 * X.sum(axis=1) / np.sqrt(FEATURES))


def run_once(width, seed, n_train=40, noise=0.2, n_test=400):
    """One trial: (train_error, test_error) for this many random features."""
    # Draw the data and the features from one seeded generator, in the agreed order

    # Turn both sets of examples into random features

    # Fit on the training features only

    # Score on both


def descent_curve(widths, seeds, n_train=40, noise=0.2):
    """The median test error over the seeds, for each width."""


if __name__ == "__main__":
    # Your own tests first, run by pytest just as they would be at home
    pytest.main(["-q", "--capture=sys", "-p", "no:cacheprovider", "test_descent.py"])

    errors = descent_curve(WIDTHS, SEEDS)
    print("features  test error")
    for width, error in zip(WIDTHS, errors):
        print(f"{width:8}  {error:10.3f}")

    # The figure: both axes on log scales, the threshold marked, every axis labelled
