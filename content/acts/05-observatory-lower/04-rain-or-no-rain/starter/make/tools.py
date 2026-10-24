"""Moss's toolbox: pieces from the last three jobs, tidied up.

load_table(path)                    (X, y): every column but the first and
                                    the last is a reading; the last is
                                    the answer. The first is the night.
train_test_split(X, y, test_fraction, rng)
                                    X_train, X_test, y_train, y_test
fit_scaler(X)                       (means, spreads), one of each per column
scale(X, means, spreads)            X standardised with those
"""
import numpy as np


def load_table(path):
    table = np.loadtxt(path, delimiter=",", skiprows=1)
    return table[:, 1:-1], table[:, -1]


def train_test_split(X, y, test_fraction, rng):
    order = rng.permutation(len(X))
    test_count = round(len(X) * test_fraction)
    test, train = order[:test_count], order[test_count:]
    return X[train], X[test], y[train], y[test]


def fit_scaler(X):
    return X.mean(axis=0), X.std(axis=0)


def scale(X, means, spreads):
    return (X - means) / spreads
