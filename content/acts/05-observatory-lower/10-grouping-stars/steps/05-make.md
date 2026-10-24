---
id: make
type: make
title: Make the star sorter
files: [stars.py]
entry: stars.py
timeout_ms: 30000
on_pass: { wendt: "Four clusters. Ninety-five, eighty, seventy, fifty-five. And the library agrees to the last star." }
hints:
  nudge: "In `k_means`, what has to be true for the loop to stop, and what goes into `history` each time round?"
  plan:
    - Start from k different stars
    - Assign each star to its nearest centre
    - Record the inertia
    - Stop when nothing changes
    - Move each centre to the middle of its stars
    - Run it from several starts and keep the best
    - Choose k at the elbow
  shape: |
    def assign(points, centres):
        distances = np.linalg.norm(points[:, np.newaxis, :] - centres[np.newaxis, :, :], axis=___)
        return distances.___(axis=1)


    def k_means(points, k, rng, max_steps=100):
        centres = initial_centres(points, k, rng)
        labels = None
        history = []
        for step in range(max_steps):
            new_labels = assign(___, ___)
            history.append(inertia(points, new_labels, ___))
            if labels is not None and np.array_equal(___, ___):
                break
            labels = new_labels
            centres = update(points, labels, centres)
        return centres, new_labels, history
---
Penhallow's plate holds 300 stars, as millimetres from the plate's corner. The requirements are at the top of `stars.py`: k-means from scratch, from several random starts, for every k from 1 to 8, then k chosen at the elbow and checked against scikit-learn.

```text
k   inertia
1    315185
2    149668
3     65315
4     17008
...
Chosen k: 4
Stars in each group: 95, 80, 70, 55
scikit-learn agrees: True
```

`points[:, np.newaxis, :] - centres[np.newaxis, :, :]` broadcasts to every star minus every centre: shape `(n, k, 2)`.

To see the groups, add `plt.scatter(stars[:, 0], stars[:, 1], c=labels)` and `plt.show()` with matplotlib. The hidden checks make sure your inertia never rises from one assignment to the next.
