"""Customer Segmentation: a wholesaler's 440 customers sorted into groups by
what they spend on, with k-means written from scratch.

GOODS                       the six kinds of goods, in column order
load_customers(path)        (spending, channels): spending is an (n, 6) array
                            of a year's spending on GOODS; channels is an array
                            of "horeca" or "retail" (written for you)
prepare(spending)           the log of the spending, then each column
                            standardised to mean 0 and spread 1
initial_centres(points, k, rng)
                            k different customers to start from, picked with
                            rng.choice(len(points), size=k, replace=False)
assign(points, centres)     for each customer, the position of its nearest
                            centre
update(points, labels, centres)
                            each centre moved to the mean of its customers; a
                            centre with none stays where it was
inertia(points, labels, centres)
                            the sum of the squared distances from each
                            customer to its own centre
k_means(points, k, rng, max_steps=100)
                            (centres, labels, history): assign and update
                            until nothing changes, or max_steps assignments;
                            history holds the inertia after each assignment
best_of(points, k, tries, rng)
                            (centres, labels, inertia): the best of tries runs
choose_k(inertias)          the smallest k for which one more group cuts the
                            inertia by less than a quarter, or the largest k
Run as a program, it prepares the spending, tries k from 1 to 8 (the best of
10 runs each, rng = np.random.default_rng(10)), chooses k, describes each
segment, and checks against scikit-learn:
k   inertia
1    2640.0
2    1848.0
3    1558.0
4    1391.9
5    1272.8
6    1182.7
7    1102.7
8    1032.1
Chosen k: 2
Segment 1: 251 customers, 3% retail, above average on fresh, frozen
Segment 2: 189 customers, 71% retail, above average on milk, grocery, detergents_paper, delicatessen
scikit-learn agrees: True
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans

GOODS = ["fresh", "milk", "grocery", "frozen", "detergents_paper", "delicatessen"]


def load_customers(path):
    customers = pd.read_csv(path)
    return customers[GOODS].to_numpy(dtype=float), customers["channel"].to_numpy()


def prepare(spending):
    logged = np.log(spending)
    return (logged - logged.mean(axis=0)) / logged.std(axis=0)


def initial_centres(points, k, rng):
    return points[rng.choice(len(points), size=k, replace=False)]


def assign(points, centres):
    distances = np.linalg.norm(points[:, np.newaxis, :] - centres[np.newaxis, :, :], axis=2)
    return distances.argmin(axis=1)


def update(points, labels, centres):
    new_centres = centres.copy()
    for j in range(len(centres)):
        members = points[labels == j]
        if len(members) > 0:
            new_centres[j] = members.mean(axis=0)
    return new_centres


def inertia(points, labels, centres):
    return np.sum((points - centres[labels]) ** 2)


def k_means(points, k, rng, max_steps=100):
    # Start from k different customers
    centres = initial_centres(points, k, rng)
    labels = None
    history = []
    for step in range(max_steps):
        # Assign each customer to its nearest centre
        new_labels = assign(points, centres)
        history.append(inertia(points, new_labels, centres))
        # Stop when nothing changes
        if labels is not None and np.array_equal(new_labels, labels):
            break
        labels = new_labels
        # Move each centre to the middle of its customers
        centres = update(points, labels, centres)
    return centres, new_labels, history


def best_of(points, k, tries, rng):
    best = None
    for attempt in range(tries):
        centres, labels, history = k_means(points, k, rng)
        if best is None or history[-1] < best[2]:
            best = (centres, labels, history[-1])
    return best


def choose_k(inertias):
    for k in sorted(inertias):
        if k + 1 in inertias and inertias[k + 1] > 0.75 * inertias[k]:
            return k
    return max(inertias)


if __name__ == "__main__":
    spending, channels = load_customers("customers.csv")
    points = prepare(spending)
    rng = np.random.default_rng(10)

    # Try every k, best of 10
    inertias, runs = {}, {}
    print("k   inertia")
    for k in range(1, 9):
        runs[k] = best_of(points, k, 10, rng)
        inertias[k] = runs[k][2]
        print(f"{k}  {inertias[k]:8.1f}")

    # Choose k at the elbow, and describe each segment, biggest first
    chosen = choose_k(inertias)
    centres, labels, spread = runs[chosen]
    print(f"Chosen k: {chosen}")
    for number, j in enumerate(np.argsort(-np.bincount(labels, minlength=chosen), kind="stable"), start=1):
        members = labels == j
        above = [name for name, value in zip(GOODS, centres[j]) if value > 0]
        print(f"Segment {number}: {members.sum()} customers, {np.mean(channels[members] == 'retail'):.0%} retail, "
              f"above average on {', '.join(above)}")

    # Check against scikit-learn
    library = KMeans(n_clusters=chosen, n_init=10, random_state=0).fit(points)
    print(f"scikit-learn agrees: {abs(library.inertia_ - spread) < 0.001 * library.inertia_}")
