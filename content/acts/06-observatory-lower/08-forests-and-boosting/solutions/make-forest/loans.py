"""Loan Approval Tree: approve or decline a loan application, from the
answers on the form, with a decision tree grown from scratch. Then a random
forest of such trees, and gradient boosting from scikit-learn, judged the way
a bank would judge them.

gini(y)                     how mixed the labels in y are: 1 minus the sum of
                            each label's share, squared (0 for an empty y)
split_score(y_left, y_right)
                            the Gini of the two sides, each weighted by its
                            share of the labels
best_split(X, y, features=None)
                            (feature, threshold) for the best question, or
                            None if no question lowers the Gini of y. Try the
                            features in column order (only those in features,
                            if it's given) and, for each, the thresholds
                            halfway between neighbouring distinct values,
                            smallest first; rows with X[:, feature] <= threshold
                            go left. A question replaces the best so far only
                            if it scores lower.
build_tree(X, y, max_depth, depth=0, max_features=None, rng=None)
                            a leaf, {"leaf": label}, when depth has reached
                            max_depth or no question helps; the label is the
                            commonest in y (on a tie, the smaller). Otherwise
                            {"feature": f, "threshold": t, "left": tree,
                            "right": tree}, each side grown one level deeper.
                            With max_features, each question considers only
                            np.sort(rng.choice(n_features, max_features,
                            replace=False)), drawn afresh for every question
predict_one(tree, row)      the label the tree gives one row
predict(tree, X)            an array with one label for each row of X
show(tree, names)           prints the tree as questions (written for you)
fit_forest(X, y, n_trees, max_depth, max_features, rng)
                            a list of n_trees trees. For each tree in turn:
                            rows = rng.integers(0, len(X), len(X)), then
                            build_tree(X[rows], y[rows], max_depth,
                            max_features=max_features, rng=rng)
forest_share(trees, X)      for each row, the share of the trees that say 1
cost(approved, y)           the bank's cost per applicant: 5 for each bad
                            loan approved, 1 for each good one declined,
                            divided by the number of applicants

Run as a program, it uses rng = np.random.default_rng(30) to lock a fifth of
the applicants away for testing, then a quarter of the rest for validation,
chooses the tree's depth by validation, shows the tree, and then compares,
on the test applicants:
depth  training  validation
    1     0.718       0.700
    2     0.747       0.685
    3     0.778       0.735
    4     0.793       0.735
    5     0.808       0.715
    6     0.838       0.675
    8     0.888       0.680
Chosen depth: 3
checking <= 1.5?
  yes: duration_months <= 22.5?
    yes: history <= 1.5?
      yes: decline
      no: approve
    no: savings <= 0.5?
      yes: decline
      no: approve
  no: amount <= 10924.5?
    yes: employment <= 2.5?
      yes: approve
      no: approve
    no: amount <= 12714.5?
      yes: decline
      no: approve
                         accuracy   cost
Approving everyone          0.645  1.775
One tree, depth 3           0.745  1.075
A forest of 50 trees        0.740  1.200
Boosting, 100 rounds        0.750  1.130
The forest, 5 in 6 sure     0.655  0.665
"""

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier

from tools import load_table, train_test_split

FEATURES = ["checking", "duration_months", "history", "amount", "savings", "employment", "age"]
DEPTHS = [1, 2, 3, 4, 5, 6, 8]
TREES = 50
SURE = 5 / 6


def gini(y):
    if len(y) == 0:
        return 0.0
    shares = np.bincount(y) / len(y)
    return 1 - np.sum(shares ** 2)


def split_score(y_left, y_right):
    total = len(y_left) + len(y_right)
    return (len(y_left) * gini(y_left) + len(y_right) * gini(y_right)) / total


def best_split(X, y, features=None):
    best = None
    best_score = gini(y)
    for feature in range(X.shape[1]) if features is None else features:
        values = np.unique(X[:, feature])
        for threshold in (values[:-1] + values[1:]) / 2:
            left = X[:, feature] <= threshold
            score = split_score(y[left], y[~left])
            if score < best_score:
                best, best_score = (int(feature), float(threshold)), score
    return best


def build_tree(X, y, max_depth, depth=0, max_features=None, rng=None):
    # Stop at the depth limit, or when no question helps
    features = None
    if max_features is not None:
        features = np.sort(rng.choice(X.shape[1], max_features, replace=False))
    split = best_split(X, y, features) if depth < max_depth else None
    if split is None:
        return {"leaf": int(np.bincount(y).argmax())}
    # Ask the best question, and grow each side one level deeper
    feature, threshold = split
    left = X[:, feature] <= threshold
    return {
        "feature": feature,
        "threshold": threshold,
        "left": build_tree(X[left], y[left], max_depth, depth + 1, max_features, rng),
        "right": build_tree(X[~left], y[~left], max_depth, depth + 1, max_features, rng),
    }


def predict_one(tree, row):
    if "leaf" in tree:
        return tree["leaf"]
    if row[tree["feature"]] <= tree["threshold"]:
        return predict_one(tree["left"], row)
    return predict_one(tree["right"], row)


def predict(tree, X):
    return np.array([predict_one(tree, row) for row in X])


def show(tree, names, depth=0, answer=""):
    """Print a tree as questions, each answer indented under its question."""
    line = "  " * depth + answer
    if "leaf" in tree:
        print(line + ("approve" if tree["leaf"] == 1 else "decline"))
        return
    print(line + f"{names[tree['feature']]} <= {tree['threshold']:g}?")
    show(tree["left"], names, depth + 1, "yes: ")
    show(tree["right"], names, depth + 1, "no: ")


def fit_forest(X, y, n_trees, max_depth, max_features, rng):
    trees = []
    for i in range(n_trees):
        # A bootstrap sample for each tree, from the one generator
        rows = rng.integers(0, len(X), len(X))
        trees.append(build_tree(X[rows], y[rows], max_depth, max_features=max_features, rng=rng))
    return trees


def forest_share(trees, X):
    return np.mean([predict(tree, X) for tree in trees], axis=0)


def cost(approved, y):
    bad_approved = np.sum((approved == 1) & (y == 0))
    good_declined = np.sum((approved == 0) & (y == 1))
    return (5 * bad_approved + good_declined) / len(y)


if __name__ == "__main__":
    X, repaid = load_table("loans.csv")
    repaid = repaid.astype(int)

    # Lock the test applicants away, then keep some back for validation
    rng = np.random.default_rng(30)
    X_rest, X_test, y_rest, y_test = train_test_split(X, repaid, 0.2, rng)
    X_train, X_val, y_train, y_val = train_test_split(X_rest, y_rest, 0.25, rng)

    # Grow a tree for each depth; score training and validation
    print("depth  training  validation")
    scores = []
    for depth in DEPTHS:
        tree = build_tree(X_train, y_train, depth)
        training = np.mean(predict(tree, X_train) == y_train)
        validation = np.mean(predict(tree, X_val) == y_val)
        scores.append(validation)
        print(f"{depth:5}  {training:8.3f}  {validation:10.3f}")

    # Choose by validation, and show the chosen tree
    chosen = DEPTHS[int(np.argmax(scores))]
    print(f"Chosen depth: {chosen}")
    tree = build_tree(X_train, y_train, chosen)
    show(tree, FEATURES)

    # A forest: deep trees on bootstrap samples, a few columns per question
    forest = fit_forest(X_train, y_train, TREES, max_depth=8, max_features=3, rng=rng)
    share = forest_share(forest, X_test)

    # Boosting, from scikit-learn: small trees, each fitted to what's left
    boosting = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=2, random_state=0)
    boosting.fit(X_train, y_train)

    # Test them all, once, by accuracy and by the bank's cost
    results = [
        ("Approving everyone", np.ones(len(y_test), dtype=int)),
        (f"One tree, depth {chosen}", predict(tree, X_test)),
        (f"A forest of {TREES} trees", (share >= 0.5).astype(int)),
        ("Boosting, 100 rounds", boosting.predict(X_test)),
        ("The forest, 5 in 6 sure", (share >= SURE).astype(int)),
    ]
    print("                         accuracy   cost")
    for label, approved in results:
        print(f"{label:<24} {np.mean(approved == y_test):8.3f}  {cost(approved, y_test):.3f}")
