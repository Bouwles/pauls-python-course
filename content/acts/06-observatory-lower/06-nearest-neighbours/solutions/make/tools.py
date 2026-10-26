"""Moss's toolbox, with a loader for tables that end in a word.

load_table(path, columns, label="species")
                                    (X, labels): X is an array with one column
                                    for each name in columns, as numbers;
                                    labels is an array of the label column's
                                    words.
train_test_split(X, y, test_fraction, rng)
                                    X_train, X_test, y_train, y_test
fit_scaler(X)                       (means, spreads), one of each per column
scale(X, means, spreads)            X standardised with those
"""
import csv

import numpy as np


def load_table(path, columns, label="species"):
    with open(path) as file:
        rows = list(csv.DictReader(file))
    X = np.array([[float(row[name]) for name in columns] for row in rows])
    labels = np.array([row[label] for row in rows])
    return X, labels


def train_test_split(X, y, test_fraction, rng):
    order = rng.permutation(len(X))
    test_count = round(len(X) * test_fraction)
    test, train = order[:test_count], order[test_count:]
    return X[train], X[test], y[train], y[test]


def fit_scaler(X):
    return X.mean(axis=0), X.std(axis=0)


def scale(X, means, spreads):
    return (X - means) / spreads
