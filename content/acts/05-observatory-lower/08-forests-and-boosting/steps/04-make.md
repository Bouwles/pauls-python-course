---
id: make
type: make
title: Ask the whole forest
files: [forest.py, tree.py, tools.py]
entry: forest.py
on_pass: { wendt: "Point oh eight two, on nights it never saw. Her margin note was right." }
hints:
  nudge: "Which generator does each forest tree draw its sample from, and how many are there? In boosting, what is each new tree fitted to?"
  plan:
    - The bar to clear, guessing the mean and one deep tree
    - Draw a bootstrap sample for each tree, from one generator
    - Grow each forest tree on its sample, and average them
    - Start from the mean
    - Find what's left
    - Fit a small tree to what's left
    - Add a little of it
    - Test them all, once
  shape: |
    def fit_forest(X, y, n_trees, max_depth, max_features, rng):
        trees = []
        for i in range(n_trees):
            rows = bootstrap(len(X), ___)
            trees.append(fit_tree(X[rows], y[rows], max_depth, max_features, ___))
        return trees


    def fit_boosting(X, y, rounds, rate, max_depth):
        start = float(np.mean(y))
        prediction = np.full(len(y), start)
        trees = []
        for i in range(rounds):
            tree = fit_tree(X, ___, max_depth)
            prediction = prediction + ___ * predict_tree(tree, X)
            trees.append(tree)
        return {"start": start, "rate": rate, "trees": trees}
---
Now both ensembles, on the whole log. The requirements are at the top of `forest.py`. `tree.py` gives you `fit_tree(X, y, max_depth, max_features=None, rng=None)` and `predict_tree(tree, X)`; you don't need to change it, though it's worth a read.

```text
Test error, in arcseconds squared:
Guessing the mean      0.611
One deep tree          0.191
A forest of 50 trees   0.113
Boosting, 100 rounds   0.082
```

`f"{label:<22}"` pads a label to 22 characters, so the numbers line up.

The forest uses the same `rng` as the split, in the order the requirements give, so your forest matches Moss's tree for tree. The program takes a second or two: that's fifty trees growing.

The hidden checks grow forests and boost on nights of their own, and try other numbers of trees and rounds.
