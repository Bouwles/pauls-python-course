---
id: make
type: make
title: Grow the question tree
files: [dew.py, tools.py]
entry: dew.py
on_pass: { wendt: "Near the dew point, clear, calm. Three questions, and I'd have asked them in that order." }
hints:
  nudge: "When does `build_tree` stop asking? Name all three reasons. And what does each recursive call need to be told about its depth?"
  plan:
    - How mixed is a pile
    - Score each side, weighted by its size
    - Candidate thresholds, halfway between readings, for every reading
    - Keep the best, if it beats asking nothing
    - Stop at the depth limit, or when no question helps
    - Ask the best question, and grow each side one level deeper
    - Choose the depth by validation, then open the test nights once
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
Now the whole log. The requirements are at the top of `dew.py`, and `show` is written for you, so you can read your tree.

```text
depth  training  validation
    1     0.800       0.825
...
    8     1.000       0.750
Chosen depth: 3
spread <= 2.45?
  yes: cloud <= 4.5?
    yes: wind <= 7.5?
      yes: dew
...
Test accuracy: 0.95
Always guessing dry: 0.82
```

`np.bincount(y)` counts the 0s and the 1s; `.argmax()` gives the commoner, and on a tie the smaller.

Some questions end in `dry` whichever way you answer. That isn't a bug: the split made one side purer, and Gini counts purity, not decisions.

The hidden checks compare your tree with Moss's on nights of their own, at several depths, and try piles where no question helps.
