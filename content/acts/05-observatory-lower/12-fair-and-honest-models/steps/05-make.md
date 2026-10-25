---
id: make
type: make
title: Make the audit
files: [audit.py]
entry: audit.py
timeout_ms: 30000
on_pass: { wendt: "Seventy-nine in a hundred, and wrong about the islanders more often than not. I'm glad I asked." }
hints:
  nudge: "Which column is only filled in on the night itself? And when you score the drawer by group, whose mistakes count in `given_away`?"
  plan:
    - Look for a column that knows the answer
    - Drop it
    - Cross-validate, with the scaling inside
    - Open the bottom drawer, once
    - One group at a time
    - The mistake that costs someone
  shape: |
    def alone_scores(X, y, folds):
        stump = DecisionTreeClassifier(max_depth=2, random_state=0)
        return [cross_val_score(stump, X[:, [___]], y, cv=folds).mean() for j in range(___)]


    def group_report(y_true, y_pred, groups):
        report = {}
        for name in sorted(set(groups)):
            mine = groups == ___
            accuracy = np.mean(y_pred[mine] == y_true[mine])
            came = mine & (y_true == ___)
            report[name] = (accuracy, np.mean(y_pred[came] == ___))
        return report
---
The bookings are in `bookings.csv`, this season's in `drawer.csv`. Each has how many days ahead it was booked, the party's size, the cloud forecast on the day, whether it was a first visit, whether the visitor lives on the island across the water, whether they signed the visitors' book, and whether they came.

The requirements are at the top of `audit.py`. Score each column alone to find one that knows the answer, and drop it. Cross-validate an honest model on the rest, then open the drawer once and report by group.

```text
Each column alone:
...
signed_book  0.98
Dropped: signed_book
Cross-validated accuracy: 0.74
Bottom drawer accuracy: 0.79
island   accuracy 0.48, slot given away 0.57
town     accuracy 0.84, slot given away 0.02
```

The island column is for the audit, not the model.
