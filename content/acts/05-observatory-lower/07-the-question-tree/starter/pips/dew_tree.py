# Pip's dew tree. Max depth three, so it can't overfit. I've learnt.
import numpy as np

from tools import load_table, train_test_split

X, dew = load_table("dew.csv")
dew = dew.astype(int)
rng = np.random.default_rng(7)
X_train, X_val, dew_train, dew_val = train_test_split(X, dew, 0.25, rng)


def gini(y):
    shares = np.bincount(y) / len(y)
    return 1 - np.sum(shares ** 2)


def best_split(X, y):
    """(feature, threshold) for the question that lowers the Gini most, or None."""
    best, best_score = None, gini(y)
    for feature in range(X.shape[1]):
        values = np.unique(X[:, feature])
        for threshold in (values[:-1] + values[1:]) / 2:
            left = X[:, feature] <= threshold
            score = (left.sum() * gini(y[left]) + (~left).sum() * gini(y[~left])) / len(y)
            if score < best_score:
                best, best_score = (feature, threshold), score
    return best


def build_tree(X, y, max_depth, depth=0):
    """A question tree no deeper than max_depth."""
    split = best_split(X, y) if depth < max_depth else None
    if split is None:
        return {"leaf": int(np.bincount(y).argmax())}
    feature, threshold = split
    left = X[:, feature] <= threshold
    return {
        "feature": feature,
        "threshold": threshold,
        "left": build_tree(X[left], y[left], max_depth, depth),
        "right": build_tree(X[~left], y[~left], max_depth, depth),
    }


def predict_one(tree, row):
    if "leaf" in tree:
        return tree["leaf"]
    if row[tree["feature"]] <= tree["threshold"]:
        return predict_one(tree["left"], row)
    return predict_one(tree["right"], row)


def count_leaves(tree):
    if "leaf" in tree:
        return 1
    return count_leaves(tree["left"]) + count_leaves(tree["right"])


if __name__ == "__main__":
    tree = build_tree(X_train, dew_train, max_depth=3)
    training = np.mean([predict_one(tree, row) for row in X_train] == dew_train)
    validation = np.mean([predict_one(tree, row) for row in X_val] == dew_val)
    print(f"Leaves: {count_leaves(tree)}")
    print(f"Training accuracy: {training:.2f}")
    print(f"Validation accuracy: {validation:.2f}")
