---
id: make
type: make
title: Run the clinic
files: [clinic.py]
entry: clinic.py
timeout_ms: 30000
on_pass: { neil.thinking: "The forest, fairly chosen, and wrong about two in three visitors from outside the city. I'm glad we asked." }
hints:
  nudge: "Which column is only filled in on the night itself? And when you score the drawer by group, whose mistakes count in `given_away`?"
  plan:
    - Look for a column that knows the answer, and drop it
    - Search the settings
    - Cross-validate every model, with the scaling inside
    - Choose by cross-validation
    - Open the bottom drawer, once
    - One group at a time, and the mistake that costs someone
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
The function list is at the top of `clinic.py`, and `load_bookings` is written.

1. Score each column alone, with a small tree cross-validated on that one column, and drop any that knows the answer.
2. On the rest, grid-search the k-NN's neighbours, then cross-validate four models, with the scaling inside a pipeline wherever there is scaling, and choose.
3. Fit the winner on every booking, open the drawer once, and score it beside always guessing the commonest answer.
4. Report by group: city visitors and those from outside.

```text
Dropped: signed_book
Best number of neighbours: 5
logistic     0.736
...
Chosen: forest
Bottom drawer accuracy: 0.77
Always guessing the commonest: 0.71
city     accuracy 0.85, slot given away 0.09
outside  accuracy 0.35, slot given away 0.64
```

The `outside` column is for the report, not the model.
