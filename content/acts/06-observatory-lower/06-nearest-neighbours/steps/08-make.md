---
id: make
type: make
title: Make the classifier
files: [classifier.py, tools.py]
entry: classifier.py
on_pass: { aaesha.pleased: "Gentoo, eight of nine, from memory alone. And the same code knows its irises. That's the test of a tool." }
hints:
  nudge: "Which animals does each vote come from: the training rows only, or the pile being scored? And which pile chooses k?"
  plan:
    - Lock the test rows away, then keep some back for validation
    - Scale with the training rows' ruler
    - Measure every distance at once
    - Find the k nearest
    - Let them vote
    - For each k, score training and validation
    - Choose by validation, then open the test rows once
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
The function list is at the top of `classifier.py`, and `tools.py` loads and splits the data. It starts with two measurements a ranger can take from a penguin on a scale plate: flipper length and body mass.

```text
 k  training  validation
 1     0.966       0.721
...
 9     0.796       0.868
...
Chosen k: 9
Test accuracy: 0.81
New: Gentoo, like 8 of the 9 nearest
```

`distances` takes `metric="manhattan"` too. `vote` breaks a tie in favour of the nearest animal: `Counter` keeps the order it first saw labels in, and they arrive nearest first. `nearest` uses `np.argsort(..., kind="stable")`, so rows at the same distance keep their order.

Write nothing that only works for penguins. When it passes, set `DATASET = "iris.csv"` and `MEASUREMENTS` to the four iris columns, and run it again.
