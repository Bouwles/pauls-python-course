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
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

FEATURES = ["cloud", "humidity", "wind", "pressure", "visibility"]


def load_evenings(path):
    evenings = np.loadtxt(path, delimiter=",", skiprows=1)
    return evenings[:, 1:6], evenings[:, 6].astype(int)


def best_neighbours(X, y, choices, folds):
    pipeline = make_pipeline(StandardScaler(), KNeighborsClassifier())
    search = GridSearchCV(pipeline, {"kneighborsclassifier__n_neighbors": choices}, cv=folds)
    search.fit(X, y)
    return search.best_params_["kneighborsclassifier__n_neighbors"]


def build_models(neighbours):
    return {
        "logistic": make_pipeline(StandardScaler(), LogisticRegression()),
        "neighbours": make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=neighbours)),
        "tree": DecisionTreeClassifier(max_depth=4, random_state=0),
        "forest": RandomForestClassifier(n_estimators=100, random_state=0),
    }


def cross_validate(models, X, y, folds):
    return {name: cross_val_score(model, X, y, cv=folds).mean() for name, model in models.items()}


def always_commonest(y_train, y_test):
    values, counts = np.unique(y_train, return_counts=True)
    commonest = values[np.argmax(counts)]
    return np.mean(y_test == commonest)


if __name__ == "__main__":
    X, y = load_evenings("seeing.csv")

    # Lock the test set away
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=9, stratify=y)

    # Search the settings
    neighbours = best_neighbours(X_train, y_train, [1, 5, 15, 25, 45], 5)
    print(f"Best number of neighbours: {neighbours}")

    # Cross-validate on training only
    models = build_models(neighbours)
    scores = cross_validate(models, X_train, y_train, 5)
    for name, score in scores.items():
        print(f"{name:<12} {score:.3f}")

    # Choose by cross-validation
    chosen = max(scores, key=scores.get)
    print(f"Chosen: {chosen}")

    # Test once
    model = models[chosen].fit(X_train, y_train)
    print(f"Test accuracy: {model.score(X_test, y_test):.3f}")
    print(f"Always guessing the commonest: {always_commonest(y_train, y_test):.3f}")
