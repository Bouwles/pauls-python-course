---
id: make-kmeans
type: make
title: Find the segments
files: [segments.py]
entry: segments.py
timeout_ms: 30000
on_pass: { riya: "Two kinds of customer. One buys fresh and frozen, one buys groceries and paper. Restaurants and shops, I'd guess." }
hints:
  nudge: "In `k_means`, what has to be true for the loop to stop, and what goes into `history` each time round?"
  plan:
    - Take the log, then scale each column
    - Start from k different customers
    - Assign each customer to its nearest centre
    - Record the inertia
    - Stop when nothing changes
    - Move each centre to the middle of its customers
    - Run it from several starts and keep the best
    - Choose k at the elbow, and say what each segment buys
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
The requirements are at the top of `segments.py`, and `load_customers` is written. Spending is very skewed: most customers spend a few thousand on frozen food, one spends sixty thousand. So `prepare` takes the log first, then standardises each column, and every kind of goods counts alike.

```text
k   inertia
1    2640.0
2    1848.0
3    1558.0
...
Chosen k: 2
Segment 1: 251 customers, 3% retail, above average on fresh, frozen
Segment 2: 189 customers, 71% retail, above average on milk, grocery, detergents_paper, delicatessen
scikit-learn agrees: True
```

A segment is above average on the goods where its centre is above 0. The `channel` column says which customers are hotels, restaurants and cafes, and which are shops. k-means never sees it, so it's an honest check afterwards.
