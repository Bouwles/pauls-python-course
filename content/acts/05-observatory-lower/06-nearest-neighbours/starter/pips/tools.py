"""Moss's toolbox, with a loader for readings that end in a word.

load_evenings(path)                 (X, sky): X is an array of the readings
                                    (every column but the first and last);
                                    sky is an array of the last column's
                                    words. The first column is the night.
train_test_split(X, y, test_fraction, rng)
                                    X_train, X_test, y_train, y_test
fit_scaler(X)                       (means, spreads), one of each per column
scale(X, means, spreads)            X standardised with those
"""
import csv

import numpy as np


def load_evenings(path):
    with open(path) as file:
        rows = list(csv.reader(file))[1:]
    X = np.array([[float(value) for value in row[1:-1]] for row in rows])
    sky = np.array([row[-1] for row in rows])
    return X, sky


def train_test_split(X, y, test_fraction, rng):
    order = rng.permutation(len(X))
    test_count = round(len(X) * test_fraction)
    test, train = order[:test_count], order[test_count:]
    return X[train], X[test], y[train], y[test]


def fit_scaler(X):
    return X.mean(axis=0), X.std(axis=0)


def scale(X, means, spreads):
    return (X - means) / spreads
