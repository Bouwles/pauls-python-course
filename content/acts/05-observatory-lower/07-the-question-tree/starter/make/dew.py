"""Penhallow's dew log, and a tree of questions about it.

gini(y)                     how mixed the labels in y are: 1 minus the sum of
                            each label's share, squared (0 for an empty y)
split_score(y_left, y_right)
                            the Gini of the two sides, each weighted by its
                            share of the labels
best_split(X, y)            (feature, threshold) for the best question, or
                            None if no question lowers the Gini of y. Try the
                            features in column order and, for each, the
                            thresholds halfway between neighbouring distinct
                            values, smallest first; rows with
                            X[:, feature] <= threshold go left. A question
                            replaces the best so far only if it scores lower.
build_tree(X, y, max_depth, depth=0)
                            a leaf, {"leaf": label}, when depth has reached
                            max_depth or no question helps; the label is the
                            commonest in y (on a tie, the smaller). Otherwise
                            {"feature": f, "threshold": t, "left": tree,
                            "right": tree}, each side grown one level deeper
predict_one(tree, row)      the label the tree gives one row
predict(tree, X)            an array with one label for each row of X
show(tree, names)           prints the tree as questions (written for you)

Run as a program, it uses rng = np.random.default_rng(7) to lock a fifth of
the nights away for testing, then a quarter of the rest for validation,
grows a tree on the training nights for each depth in DEPTHS, and prints:
depth  training  validation
    1     0.800       0.825
...
    8     1.000       0.750
Chosen depth: 3
then the chosen tree, as questions, and:
Test accuracy: 0.95
Always guessing dry: 0.82
"""
# Copied by Professor Wendt from a page torn out of the dew log:
# A tree asks its questions out loud, which is more than the machine on
# the hill does. I let one grow on these readings with no limit. The first
# three questions were sensible. The fourteenth was about a single night
# in March. A.P.

import numpy as np

from tools import load_table, train_test_split

FEATURES = ["spread", "wind", "cloud", "humidity"]
DEPTHS = [1, 2, 3, 4, 5, 6, 8]


def show(tree, names, depth=0, answer=""):
    """Print a tree as questions, each answer indented under its question."""
    line = "  " * depth + answer
    if "leaf" in tree:
        print(line + ("dew" if tree["leaf"] == 1 else "dry"))
        return
    print(line + f"{names[tree['feature']]} <= {tree['threshold']:g}?")
    show(tree["left"], names, depth + 1, "yes: ")
    show(tree["right"], names, depth + 1, "no: ")


if __name__ == "__main__":
    X, dew = load_table("dew.csv")
    dew = dew.astype(int)

    # Lock the test nights away, then keep some back for validation

    # Grow a tree for each depth; score training and validation

    # Choose by validation, and show the chosen tree

    # Open the test nights, once, against always guessing dry
