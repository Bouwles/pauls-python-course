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
    rng = np.random.default_rng(seed)
    X_train = rng.normal(size=(n_train, FEATURES))
    y_train = true_answer(X_train) + rng.normal(0, noise, n_train)
    X_test = rng.normal(size=(n_test, FEATURES))
    y_test = true_answer(X_test)
    W = rng.normal(size=(FEATURES, width)) / np.sqrt(FEATURES)

    train_features = relu_features(X_train, W)
    test_features = relu_features(X_test, W)
    weights = fit_min_norm(train_features, y_train)
    return mse(train_features @ weights, y_train), mse(test_features @ weights, y_test)


def descent_curve(widths, seeds, n_train=40, noise=0.2):
    """The median test error over the seeds, for each width."""
    return [float(np.median([run_once(width, seed, n_train, noise)[1] for seed in seeds])) for width in widths]


if __name__ == "__main__":
    # Your own tests first, run by pytest just as they would be at home
    pytest.main(["-q", "--capture=sys", "-p", "no:cacheprovider", "test_descent.py"])

    errors = descent_curve(WIDTHS, SEEDS)
    print("features  test error")
    for width, error in zip(WIDTHS, errors):
        print(f"{width:8}  {error:10.3f}")

    plt.plot(WIDTHS, errors, marker="o", label="median test error, 10 seeds")
    plt.axvline(40, linestyle="--", color="0.5", label="40 features: one per training example")
    plt.xscale("log")
    plt.yscale("log")
    plt.xlabel("random features (log scale)")
    plt.ylabel("test error (log scale)")
    plt.title("Down, up, and down again")
    plt.legend()
    plt.show()
