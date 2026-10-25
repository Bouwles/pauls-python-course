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


def mse(predicted, actual):
    return np.mean((predicted - actual) ** 2)


def bootstrap(n, rng):
    return rng.integers(0, n, n)


def fit_forest(X, y, n_trees, max_depth, max_features, rng):
    trees = []
    for i in range(n_trees):
        rows = bootstrap(len(X), rng)
        trees.append(fit_tree(X[rows], y[rows], max_depth, max_features, rng))
    return trees


def predict_forest(trees, X):
    return np.mean([predict_tree(tree, X) for tree in trees], axis=0)


def fit_boosting(X, y, rounds, rate, max_depth):
    # Start from the mean
    start = float(np.mean(y))
    prediction = np.full(len(y), start)
    trees = []
    for i in range(rounds):
        # Find what's left, and fit a small tree to it
        tree = fit_tree(X, y - prediction, max_depth)
        # Add a little of it
        prediction = prediction + rate * predict_tree(tree, X)
        trees.append(tree)
    return {"start": start, "rate": rate, "trees": trees}


def predict_boosting(model, X):
    prediction = np.full(len(X), model["start"])
    for tree in model["trees"]:
        prediction = prediction + model["rate"] * predict_tree(tree, X)
    return prediction


if __name__ == "__main__":
    X, seeing = load_table("seeing.csv")
    rng = np.random.default_rng(8)
    X_train, X_test, y_train, y_test = train_test_split(X, seeing, 0.25, rng)

    # The bar to clear: guessing the mean, and one deep tree
    guess = np.full(len(y_test), np.mean(y_train))
    tree = fit_tree(X_train, y_train, max_depth=8)

    # A forest: deep trees on bootstrap samples, averaged
    forest = fit_forest(X_train, y_train, TREES, max_depth=8, max_features=2, rng=rng)

    # Boosting: small trees on what's left, a little at a time
    boosted = fit_boosting(X_train, y_train, ROUNDS, rate=0.1, max_depth=2)

    # Test them all, once
    print("Test error, in arcseconds squared:")
    results = [
        ("Guessing the mean", guess),
        ("One deep tree", predict_tree(tree, X_test)),
        (f"A forest of {TREES} trees", predict_forest(forest, X_test)),
        (f"Boosting, {ROUNDS} rounds", predict_boosting(boosted, X_test)),
    ]
    for label, predicted in results:
        print(f"{label:<22} {mse(predicted, y_test):.3f}")
