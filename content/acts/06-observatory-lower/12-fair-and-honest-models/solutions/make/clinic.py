"""Model Evaluation Clinic: before a model gives anyone's telescope slot away
at the observatory's open nights, examine it. Find the column that leaks the
answer, compare four models honestly with cross-validation and a grid search,
test the chosen one once on this season's bookings, and see who it is wrong
about.

FEATURES        the five columns the model may learn from, in this order
load_bookings(path)
        (X, y, groups): X is the (n, 5) array of FEATURES, y is came (1 or
        0), and groups holds "island" or "town" for each booking, from the
        island column. Where people live is for the audit, not the model
alone_scores(X, y, folds)
        a list: for each column on its own, the cross-validated accuracy
        of DecisionTreeClassifier(max_depth=2, random_state=0)
suspicious(names, scores, limit)
        the names whose score alone is at least limit
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
        the accuracy on y_test of always guessing whichever answer is
        commonest in y_train
group_report(y_true, y_pred, groups)
        a dict: each group's name and a pair (accuracy, given_away), where
        given_away is the share of that group's visitors who came but were
        predicted not to, and so would have lost their slot

Run as a program, it scores each column alone on bookings.csv and drops any
that score 0.95 or more by themselves. On what's left, it searches 1, 5, 15,
25 and 45 neighbours, cross-validates the four models with 5 folds, and fits
the best on all the bookings. Only then does it open drawer.csv, this
season's bookings, once, and report by group:
Each column alone:
days_ahead   0.68
party        0.60
cloud        0.67
first_visit  0.60
signed_book  0.98
Dropped: signed_book
Best number of neighbours: 5
logistic     0.736
neighbours   0.764
tree         0.750
forest       0.778
Chosen: forest
Bottom drawer accuracy: 0.77
Always guessing the commonest: 0.71
island   accuracy 0.35, slot given away 0.64
town     accuracy 0.85, slot given away 0.09
"""
# Copied by Professor Wendt from a card in the bottom drawer:
# The machine learned to light the lamp when Tom's kettle boiled. Right
# every night for a month, for the wrong reason: Tom puts the kettle on
# at dusk. I took the kettle out of its readings, and it was wrong for a
# week. It had never known why. A.P.

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

FEATURES = ["days_ahead", "party", "cloud", "first_visit", "signed_book"]


def load_bookings(path):
    bookings = np.loadtxt(path, delimiter=",", skiprows=1)
    X = bookings[:, [1, 2, 3, 4, 6]]
    y = bookings[:, 7].astype(int)
    groups = np.where(bookings[:, 5] == 1, "island", "town")
    return X, y, groups


def alone_scores(X, y, folds):
    stump = DecisionTreeClassifier(max_depth=2, random_state=0)
    return [cross_val_score(stump, X[:, [j]], y, cv=folds).mean() for j in range(X.shape[1])]


def suspicious(names, scores, limit):
    return [name for name, score in zip(names, scores) if score >= limit]


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
    return np.mean(y_test == values[np.argmax(counts)])


def group_report(y_true, y_pred, groups):
    report = {}
    for name in sorted(set(groups)):
        mine = groups == name
        accuracy = np.mean(y_pred[mine] == y_true[mine])
        came = mine & (y_true == 1)
        given_away = np.mean(y_pred[came] == 0)
        report[name] = (accuracy, given_away)
    return report


if __name__ == "__main__":
    X, y, groups = load_bookings("bookings.csv")

    # Look for a column that knows the answer, and drop it
    scores = alone_scores(X, y, 5)
    print("Each column alone:")
    for name, score in zip(FEATURES, scores):
        print(f"{name:<12} {score:.2f}")
    dropped = suspicious(FEATURES, scores, 0.95)
    print("Dropped:", ", ".join(dropped))
    keep = [j for j, name in enumerate(FEATURES) if name not in dropped]
    X = X[:, keep]

    # Search the settings, then cross-validate every model, scaling inside
    neighbours = best_neighbours(X, y, [1, 5, 15, 25, 45], 5)
    print(f"Best number of neighbours: {neighbours}")
    models = build_models(neighbours)
    results = cross_validate(models, X, y, 5)
    for name, score in results.items():
        print(f"{name:<12} {score:.3f}")
    chosen = max(results, key=results.get)
    print(f"Chosen: {chosen}")

    # Open the bottom drawer, once
    model = models[chosen].fit(X, y)
    X_drawer, y_drawer, groups_drawer = load_bookings("drawer.csv")
    predicted = model.predict(X_drawer[:, keep])
    print(f"Bottom drawer accuracy: {np.mean(predicted == y_drawer):.2f}")
    print(f"Always guessing the commonest: {always_commonest(y, y_drawer):.2f}")

    # One group at a time
    for name, (accuracy, given_away) in group_report(y_drawer, predicted, groups_drawer).items():
        print(f"{name:<8} accuracy {accuracy:.2f}, slot given away {given_away:.2f}")
