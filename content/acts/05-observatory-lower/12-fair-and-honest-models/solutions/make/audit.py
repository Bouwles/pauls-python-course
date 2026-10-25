"""Open-night bookings at the observatory: who booked, and whether they came.
Before the model gives anyone's telescope slot away, audit it.

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
honest_model()
        an unfitted pipeline: StandardScaler, then LogisticRegression()
group_report(y_true, y_pred, groups)
        a dict: each group's name and a pair (accuracy, given_away), where
        given_away is the share of that group's visitors who came but were
        predicted not to, and so would have lost their slot

Run as a program, it scores each column alone on bookings.csv and drops any
that score 0.95 or more by themselves. It cross-validates the honest model
on what's left, with 5 folds, fits it on all the bookings, and only then
opens drawer.csv, this season's bookings, once, and reports by group:
Each column alone:
days_ahead   0.68
party        0.60
cloud        0.67
first_visit  0.60
signed_book  0.98
Dropped: signed_book
Cross-validated accuracy: 0.74
Bottom drawer accuracy: 0.79
island   accuracy 0.48, slot given away 0.57
town     accuracy 0.84, slot given away 0.02
"""
# Copied by Professor Wendt from a card in the bottom drawer:
# The machine learned to light the lamp when Tom's kettle boiled. Right
# every night for a month, for the wrong reason: Tom puts the kettle on
# at dusk. I took the kettle out of its readings, and it was wrong for a
# week. It had never known why. A.P.

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
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


def honest_model():
    return make_pipeline(StandardScaler(), LogisticRegression())


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

    # Look for a column that knows the answer
    scores = alone_scores(X, y, 5)
    print("Each column alone:")
    for name, score in zip(FEATURES, scores):
        print(f"{name:<12} {score:.2f}")
    dropped = suspicious(FEATURES, scores, 0.95)
    print("Dropped:", ", ".join(dropped))
    keep = [j for j, name in enumerate(FEATURES) if name not in dropped]

    # Cross-validate, with the scaling inside
    model = honest_model()
    print(f"Cross-validated accuracy: {cross_val_score(model, X[:, keep], y, cv=5).mean():.2f}")

    # Open the bottom drawer, once
    model.fit(X[:, keep], y)
    X_drawer, y_drawer, groups_drawer = load_bookings("drawer.csv")
    predicted = model.predict(X_drawer[:, keep])
    print(f"Bottom drawer accuracy: {np.mean(predicted == y_drawer):.2f}")

    # One group at a time
    for name, (accuracy, given_away) in group_report(y_drawer, predicted, groups_drawer).items():
        print(f"{name:<8} accuracy {accuracy:.2f}, slot given away {given_away:.2f}")
