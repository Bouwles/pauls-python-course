"""Model Evaluation Clinic: before a model gives anyone's telescope slot away
at the Clocktower's stargazing nights, examine it. Find the column that leaks the
answer, compare four models honestly with cross-validation and a grid search,
test the chosen one once on this season's bookings, and see who it is wrong
about.

FEATURES        the five columns the model may learn from, in this order
load_bookings(path)
        (X, y, groups): X is the (n, 5) array of FEATURES, y is came (1 or
        0), and groups holds "outside" or "city" for each booking, from the
        outside column. Where people live is for the audit, not the model
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
city     accuracy 0.85, slot given away 0.09
outside  accuracy 0.35, slot given away 0.64
"""

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
    groups = np.where(bookings[:, 5] == 1, "outside", "city")
    return X, y, groups


if __name__ == "__main__":
    X, y, groups = load_bookings("bookings.csv")

    # Look for a column that knows the answer, and drop it

    # Search the settings, then cross-validate every model, scaling inside

    # Open the bottom drawer, once

    # One group at a time
