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

FEATURES = ["days_ahead", "party", "cloud", "first_visit", "signed_book"]


if __name__ == "__main__":
    X, y, groups = load_bookings("bookings.csv")

    # Look for a column that knows the answer

    # Cross-validate, with the scaling inside

    # Open the bottom drawer, once

    # One group at a time
