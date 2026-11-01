---
id: make-forest
type: make
title: Ask the whole forest
files: [loans.py, tools.py]
entry: loans.py
starter_from: make-tree
timeout_ms: 60000
on_pass: { paul.proud: "By accuracy they're all the same. By the bank's sums, a sure forest costs a third of approving everyone." }
hints:
  nudge: "Which generator does each tree draw its rows from, and how many generators are there? And which question gets its own draw of columns?"
  plan:
    - Draw each question's columns, if max_features is given
    - Draw a bootstrap sample for each tree, from one generator
    - Grow each tree on its sample, and count their votes
    - Boost with scikit-learn
    - Test them all, once, by accuracy and by cost
  shape: |
    def build_tree(X, y, max_depth, depth=0, max_features=None, rng=None):
        features = None
        if max_features is not None:
            features = np.sort(rng.choice(X.shape[1], ___, replace=False))
        split = best_split(X, y, ___) if depth < max_depth else None
        ...


    def fit_forest(X, y, n_trees, max_depth, max_features, rng):
        trees = []
        for i in range(n_trees):
            rows = rng.integers(0, len(X), ___)
            trees.append(build_tree(X[rows], y[rows], max_depth, max_features=max_features, rng=___))
        return trees
---
Give `best_split` an optional `features` list and `build_tree` optional `max_features` and `rng`, so each question looks at a random few columns. Then add `fit_forest`, `forest_share` and `cost`:

```text
fit_forest(X, y, n_trees, max_depth, max_features, rng)  for each tree: rows =
        rng.integers(0, len(X), len(X)), then a tree grown on X[rows], y[rows]
forest_share(trees, X)  for each row, the share of the trees that say 1
cost(approved, y)  (5 * bad loans approved + good loans declined) / len(y)
```

The bank's own figures say approving a bad loan costs five times as much as turning down a good one. After the tree, grow 50 trees of depth 8 with 3 columns per question from the same `rng`, boost with scikit-learn's `GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=2, random_state=0)`, and print the comparison in the Ask. The forest takes a few seconds.
