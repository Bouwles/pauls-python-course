"""Moss's regression tree: the question tree from the last job, for numbers.

fit_tree(X, y, max_depth, max_features=None, rng=None)
        a tree, grown no deeper than max_depth. A leaf is {"value": v}, the
        mean of its rows' y. A question is {"feature": f, "threshold": t,
        "left": tree, "right": tree}, with the rows where X[:, f] <= t on
        the left. Each question is the one that leaves the smallest total
        squared error around the two sides' means. With max_features, each
        question only considers that many readings, picked at random with
        rng.choice(number_of_readings, max_features, replace=False).
predict_tree(tree, X)
        an array with one prediction for each row of X
"""
import numpy as np


def _best_question(X, y, features):
    """(feature, threshold) that lowers the squared error most, or None."""
    best = None
    best_error = np.sum((y - y.mean()) ** 2)
    for feature in features:
        order = np.argsort(X[:, feature], kind="stable")
        values, targets = X[order, feature], y[order]
        count = np.arange(1, len(targets))
        left_sum = np.cumsum(targets)[:-1]
        left_squares = np.cumsum(targets ** 2)[:-1]
        right_sum = targets.sum() - left_sum
        right_squares = np.sum(targets ** 2) - left_squares
        error = (left_squares - left_sum ** 2 / count) + (right_squares - right_sum ** 2 / (len(targets) - count))
        # No question can separate two equal readings.
        error[values[:-1] == values[1:]] = np.inf
        i = int(np.argmin(error))
        if error[i] < best_error - 1e-9:
            best_error = error[i]
            best = (int(feature), float((values[i] + values[i + 1]) / 2))
    return best


def fit_tree(X, y, max_depth, max_features=None, rng=None, depth=0):
    question = None
    if depth < max_depth and len(y) > 1:
        features = range(X.shape[1])
        if max_features is not None:
            features = rng.choice(X.shape[1], max_features, replace=False)
        question = _best_question(X, y, features)
    if question is None:
        return {"value": float(np.mean(y))}
    feature, threshold = question
    left = X[:, feature] <= threshold
    return {
        "feature": feature,
        "threshold": threshold,
        "left": fit_tree(X[left], y[left], max_depth, max_features, rng, depth + 1),
        "right": fit_tree(X[~left], y[~left], max_depth, max_features, rng, depth + 1),
    }


def _predict_row(tree, row):
    while "value" not in tree:
        tree = tree["left"] if row[tree["feature"]] <= tree["threshold"] else tree["right"]
    return tree["value"]


def predict_tree(tree, X):
    return np.array([_predict_row(tree, row) for row in X])
