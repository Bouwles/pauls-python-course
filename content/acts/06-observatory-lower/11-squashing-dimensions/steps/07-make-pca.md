---
id: make-pca
type: make
title: Two axes that matter
files: [segments.py]
entry: segments.py
starter_from: make-kmeans
timeout_ms: 30000
on_pass: { wendt: "Shop goods one way, kitchen goods the other. Seven tenths of everything, on two axes I can name." }
hints:
  nudge: "What order does `np.linalg.eigh` give the eigenvalues in, and where does each eigenvector live: a row or a column?"
  plan:
    - Centre each column
    - The covariance matrix
    - Its eigenvectors, biggest first
    - Turn each round so its biggest number is positive
    - How much each explains
    - Name what each of the first two leans on
  shape: |
    def principal_components(points):
        centred = points - points.mean(axis=___)
        values, vectors = np.linalg.eigh(centred.T @ centred / (len(points) - 1))
        order = np.argsort(values)[___]
        values, vectors = values[order], vectors[:, ___]
        ...
---
Add `principal_components` and `explained_ratio` to `segments.py`, as in Moss's tailoring, on the prepared spending. Then, after the segments, print what the first two components explain and which goods each leans on: those whose number in it is above 0.4.

```text
Component 1 explains 44%: milk, grocery, detergents_paper
Component 2 explains 27%: fresh, frozen, delicatessen
```

An eigenvector and its negative are the same line, so turn each component round if its biggest number is negative. Then "leans on" means the same thing every time.

To see the two segments on the two axes, squash with `(points - points.mean(axis=0)) @ components[:, :2]`, and `plt.scatter` the result coloured by `labels`.
