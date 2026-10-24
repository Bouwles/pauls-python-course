"""Penhallow's seeing log: five readings each evening, and whether the night
turned out usable. Which model forecasts it best, honestly?

FEATURES        the five readings, in column order
load_evenings(path)
        (X, y): X is the (n, 5) array of readings, y is usable, 1 or 0
best_neighbours(X, y, choices, folds)
        a grid search: the number of neighbours, from choices, with the best
        cross-validated accuracy for StandardScaler then KNeighborsClassifier
build_models(neighbours)
        a dict of four unfitted models, by name:
          "logistic"    StandardScaler, then LogisticRegression()
          "neighbours"  StandardScaler, then KNeighborsClassifier(n_neighbors=neighbours)
          "tree"        DecisionTreeClassifier(max_depth=4, random_state=0)
          "forest"      RandomForestClassifier(n_estimators=100, random_state=0)
cross_validate(models, X, y, folds)
        a dict: each model's name and its mean accuracy over that many folds
always_commonest(y_train, y_test)
        the baseline: the accuracy on y_test of always guessing whichever
        answer is commonest in y_train

Run as a program, it locks a quarter of the evenings away with
train_test_split(X, y, test_size=0.25, random_state=9, stratify=y). On the
training evenings only, it searches 1, 5, 15, 25 and 45 neighbours, then
cross-validates the four models with 5 folds. It fits the best of them on all
the training evenings, and only then opens the test evenings:
Best number of neighbours: 5
logistic     0.908
neighbours   0.892
tree         0.875
forest       0.896
Chosen: logistic
Test accuracy: 0.938
Always guessing the commonest: 0.662
"""
# Copied by Professor Wendt from the back page of the seeing log:
# Four ways to forecast a clear night, each built by hand over a winter.
# Then the library came, and each one was a line. I kept the hand-built
# ones. When a line is wrong it can't tell you where. A.P.

import numpy as np

FEATURES = ["cloud", "humidity", "wind", "pressure", "visibility"]


if __name__ == "__main__":
    X, y = load_evenings("seeing.csv")

    # Lock the test set away

    # Search the settings

    # Cross-validate on training only

    # Choose by cross-validation

    # Test once
