---
id: make
type: make
title: Make the book of nights
files: [nights.py, tools.py]
entry: nights.py
on_pass: { wendt: "Fog, six of nine. I've told Captain Ferro. He said he'd already smelt it, but he wrote it down." }
hints:
  nudge: "Which nights does each evening's vote come from: the training nights only, or the pile it's being scored on? And which pile chooses k?"
  plan:
    - Lock the test evenings away, then keep some back for validation
    - Scale with the training evenings' ruler
    - Measure every distance at once
    - Find the k nearest
    - Let them vote
    - For each k, score training and validation
    - Choose by validation, then open the test evenings once
  shape: |
    def distances(X, point, metric="euclidean"):
        differences = X - point
        if metric == "manhattan":
            return np.abs(differences).sum(axis=___)
        return np.sqrt((differences ** 2).sum(axis=___))


    def nearest(X, point, k, metric="euclidean"):
        return np.argsort(distances(X, point, metric), kind="stable")[___]


    def predict(X_train, labels, X_new, k, metric="euclidean"):
        return np.array([vote(labels[nearest(___, point, k, metric)]) for point in ___])
---
Now the whole notebook. The requirements are at the top of `nights.py`, and `tools.py` has a loader for rows that end in a word.

```text
 k  training  validation
 1     1.000       0.792
 3     0.889       0.771
...
21     0.833       0.833
Chosen k: 9
Test accuracy: 0.77
Tonight: fog, like 6 of the 9 nearest nights
```

`Counter(labels).most_common(1)[0][0]`, from `collections`, gives the commonest label, and on a tie the one it saw first. Labels arrive nearest first, so that's the nearest night's.

Look at the training column at k = 1: it's always perfect, and it means nothing. The validation column climbs to k = 9, then sags: a small k listens to single odd nights, and a large one drowns fog in a crowd of clear ones.

The hidden checks compare your forecasts with Moss's on readings of their own, break ties, and try other ks and other evenings.
