---
id: make
type: make
title: Make the honest comparison
files: [seeing.py]
entry: seeing.py
timeout_ms: 30000
on_pass: { wendt: "Logistic regression. The plainest thing on her shelf, and the best of the four. I find that cheering." }
hints:
  nudge: "Which evenings may the grid search and the cross-validation see, and which only the very last line?"
  plan:
    - Load the readings
    - Lock the test set away
    - Search the settings
    - Cross-validate on training only
    - Choose by cross-validation
    - Test once
  shape: |
    def best_neighbours(X, y, choices, folds):
        pipeline = make_pipeline(___(), KNeighborsClassifier())
        search = GridSearchCV(pipeline, {"___": choices}, cv=___)
        search.fit(X, y)
        return search.best_params_[___]


    def cross_validate(models, X, y, folds):
        return {name: cross_val_score(___, X, y, cv=___).mean()
                for name, model in models.items()}


    chosen = max(scores, key=scores.get)
    model = models[chosen].fit(___, ___)
---
Penhallow forecast usable nights four ways, each built by hand: logistic regression, nearest neighbours, a question tree and a forest. Now they're a line each. Which is best, judged fairly?

The requirements are at the top of `seeing.py`. Lock a quarter of the evenings away. On the rest, find the best number of neighbours by grid search, cross-validate all four models, and choose the best. Only then fit it and open the test evenings, once, beside the simplest forecast there is: always guessing the commonest answer.

```text
Best number of neighbours: 5
logistic     0.908
neighbours   0.892
tree         0.875
forest       0.896
Chosen: logistic
Test accuracy: 0.938
Always guessing the commonest: 0.662
```

Trees ask about one reading at a time, so they don't need scaling. The checks run your functions on readings of their own. scikit-learn takes a few seconds to wake up the first time.
