"""Penhallow's seeing log, forecast by committee.

mse(predicted, actual)      the mean squared error
bootstrap(n, rng)           n row positions drawn at random, with replacement:
                            rng.integers(0, n, n)
fit_forest(X, y, n_trees, max_depth, max_features, rng)
                            a list of n_trees trees. For each tree in turn:
                            rows = bootstrap(len(X), rng), then
                            fit_tree(X[rows], y[rows], max_depth,
                            max_features, rng)
predict_forest(trees, X)    the mean of the trees' predictions, row by row
fit_boosting(X, y, rounds, rate, max_depth)
                            {"start": the mean of y, "rate": rate,
                            "trees": [...]}. Starting from the mean, each
                            round fits a tree of max_depth to y minus the
                            prediction so far, then adds rate times that
                            tree's predictions
predict_boosting(model, X)  the start, plus rate times each tree's
                            predictions

Run as a program, it uses rng = np.random.default_rng(8) to lock a quarter
of the nights away for testing (train_test_split from tools.py), then the
same rng for the forest, and prints:
Test error, in arcseconds squared:
Guessing the mean      0.611
One deep tree          0.191
A forest of 50 trees   0.113
Boosting, 100 rounds   0.082

The deep tree and the forest's trees have a max_depth of 8; the forest's
trees consider 2 readings per question. Boosting uses trees of depth 2 and
a rate of 0.1. Each label is printed left-aligned in 22 characters.
"""
import numpy as np

from tools import load_table, train_test_split
from tree import fit_tree, predict_tree

TREES = 50
ROUNDS = 100


if __name__ == "__main__":
    X, seeing = load_table("seeing.csv")
    rng = np.random.default_rng(8)
    X_train, X_test, y_train, y_test = train_test_split(X, seeing, 0.25, rng)

    # The bar to clear: guessing the mean, and one deep tree

    # A forest: deep trees on bootstrap samples, averaged

    # Boosting: small trees on what's left, a little at a time

    # Test them all, once
