---
id: make-tree
type: make
title: Grow the loan tree
files: [loans.py, tools.py]
entry: loans.py
on_pass: { paul.pleased: "Overdrawn, a long loan, no savings: decline. A loan officer could follow that. I've marked worse rules." }
hints:
  nudge: "When does `build_tree` stop asking? Name all three reasons. And what does each recursive call need to be told about its depth?"
  plan:
    - How mixed is a pile
    - Score each side, weighted by its size
    - Candidate thresholds, halfway between readings, for every column
    - Keep the best, if it beats asking nothing
    - Stop at the depth limit, or when no question helps
    - Ask the best question, and grow each side one level deeper
    - Choose the depth by validation, then open the test applicants once
  shape: |
    def best_split(X, y):
        best, best_score = None, gini(y)
        for feature in range(X.shape[1]):
            values = np.unique(X[:, feature])
            for threshold in (values[:-1] + values[1:]) / 2:
                left = X[:, feature] <= ___
                score = split_score(y[left], y[___])
                if score ___ best_score:
                    best, best_score = (feature, float(threshold)), score
        return best


    def build_tree(X, y, max_depth, depth=0):
        split = best_split(X, y) if depth < ___ else None
        if split is None:
            return {"leaf": int(np.bincount(y).___())}
        ...
---
The requirements are at the top of `loans.py`, and `show` is written for you, so you can read your tree.

```text
depth  training  validation
    1     0.718       0.700
...
    3     0.778       0.735
...
    8     0.888       0.680
Chosen depth: 3
checking <= 1.5?
  yes: duration_months <= 22.5?
...
Test accuracy: 0.745
Approving everyone: 0.645
```

`checking <= 1.5?` asks whether the applicant is overdrawn or has under 200 DM in the account. `np.bincount(y).argmax()` gives the commoner label, and on a tie the smaller.

Some questions end in `approve` whichever way you answer. That isn't a bug: the split made one side purer, and Gini counts purity, not decisions.

The hidden checks compare your tree with Paul's on applicants of their own, at several depths.
