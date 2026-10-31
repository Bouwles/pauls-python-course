"""Loan Approval Tree: approve or decline a loan application, from the
answers on the form, with a decision tree grown from scratch.

gini(y)                     how mixed the labels in y are: 1 minus the sum of
                            each label's share, squared (0 for an empty y)
split_score(y_left, y_right)
                            the Gini of the two sides, each weighted by its
                            share of the labels
best_split(X, y)            (feature, threshold) for the best question, or
                            None if no question lowers the Gini of y. Try the
                            features in column order and, for each, the thresholds
                            halfway between neighbouring distinct values,
                            smallest first; rows with X[:, feature] <= threshold
                            go left. A question replaces the best so far only
                            if it scores lower.
build_tree(X, y, max_depth, depth=0)
                            a leaf, {"leaf": label}, when depth has reached
                            max_depth or no question helps; the label is the
                            commonest in y (on a tie, the smaller). Otherwise
                            {"feature": f, "threshold": t, "left": tree,
                            "right": tree}, each side grown one level deeper
predict_one(tree, row)      the label the tree gives one row
predict(tree, X)            an array with one label for each row of X
show(tree, names)           prints the tree as questions (written for you)
Run as a program, it uses rng = np.random.default_rng(30) to lock a fifth of
the applicants away for testing, then a quarter of the rest for validation,
chooses the tree's depth by validation, shows the tree, and tests it once:
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
Test accuracy: 0.745
Approving everyone: 0.645
"""

import numpy as np

from tools import load_table, train_test_split

FEATURES = ["checking", "duration_months", "history", "amount", "savings", "employment", "age"]
DEPTHS = [1, 2, 3, 4, 5, 6, 8]


def show(tree, names, depth=0, answer=""):
    """Print a tree as questions, each answer indented under its question."""
    line = "  " * depth + answer
    if "leaf" in tree:
        print(line + ("approve" if tree["leaf"] == 1 else "decline"))
        return
    print(line + f"{names[tree['feature']]} <= {tree['threshold']:g}?")
    show(tree["left"], names, depth + 1, "yes: ")
    show(tree["right"], names, depth + 1, "no: ")


if __name__ == "__main__":
    X, repaid = load_table("loans.csv")
    repaid = repaid.astype(int)

    # Lock the test applicants away, then keep some back for validation

    # Grow a tree for each depth; score training and validation

    # Choose by validation, and show the chosen tree

    # Open the test applicants, once, against approving everyone
