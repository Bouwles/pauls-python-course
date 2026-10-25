---
id: make
type: make
title: Make the squasher
files: [filters.py]
entry: filters.py
on_pass: { wendt: "Two numbers per star, and almost nothing lost. Twelve filters, and she only ever needed two." }
hints:
  nudge: "What order does `np.linalg.eigh` give the eigenvalues in, and where does each eigenvector live: a row or a column?"
  plan:
    - Load the readings
    - Centre each column
    - The covariance matrix
    - Its eigenvectors, biggest first
    - How much each explains
    - Squash onto the first two
    - Rebuild, and measure what was lost
    - Check against the SVD
  shape: |
    def principal_components(X):
        centred, means = centre(X)
        values, vectors = np.linalg.eigh(covariance(___))
        order = np.argsort(values)[___]
        return values[order], vectors[:, ___]


    def project(X, means, components, k):
        return (X - ___) @ components[:, ___]


    def rebuild(Z, means, components):
        k = Z.shape[1]
        return Z @ components[:, :k].___ + means
---
Now Penhallow's whole filter book. The requirements are at the top of `filters.py`: PCA from scratch, how much each component explains, the stars squashed to two numbers each and rebuilt, and a check against numpy's singular value decomposition.

```text
component  explained  total
    1        0.854    0.854
    2        0.145    0.999
...
Components for 99%: 2
Squashed: (200, 12) to (200, 2)
Rebuilt from 2, mean squared error: 0.0021
The SVD agrees: True
```

`np.linalg.svd(centred, compute_uv=False)` gives the singular values of the centred readings. Squared and divided by `n - 1`, they're the same variances, found another way.

Then look: print the first two components. One is the same number twelve times; the other runs from one sign to the other, blue to red. And `plt.scatter(squashed[:, 0], squashed[:, 1])` draws all 200 stars on one page.
