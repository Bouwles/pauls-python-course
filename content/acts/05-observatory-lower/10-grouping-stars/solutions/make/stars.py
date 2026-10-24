"""Penhallow's plate: where every star sits, in millimetres from the corner.
The stars clump. How many clumps, and which star is in which?

load_plate(path)
        an (n, 2) array: each star's x and y
initial_centres(points, k, rng)
        k different stars to start from, picked with
        rng.choice(len(points), size=k, replace=False): a (k, 2) array
assign(points, centres)
        for each star, the position in centres of its nearest centre
update(points, labels, centres)
        a new (k, 2) array: each centre moved to the mean of its stars. A
        centre with no stars stays where it was
inertia(points, labels, centres)
        the sum of the squared distances from each star to its own centre
k_means(points, k, rng, max_steps=100)
        (centres, labels, history): start from initial_centres, then assign
        and update until no star changes group, or max_steps assignments.
        history holds the inertia after each assignment
best_of(points, k, tries, rng)
        (centres, labels, inertia): k_means run tries times with the same
        rng, keeping the run with the lowest final inertia
choose_k(inertias)
        inertias is a dict of k to inertia, for k = 1, 2, 3 and so on. The
        smallest k for which one more group cuts the inertia by less than
        a quarter, or the largest k if every extra group pays

Run as a program, it uses rng = np.random.default_rng(10) and the best of
10 tries for each k from 1 to 8, chooses k, and checks the chosen k against
scikit-learn's KMeans(n_clusters=k, n_init=10, random_state=0):
k   inertia
1    315185
2    149668
3     65315
4     17008
...
Chosen k: 4
Stars in each group: 95, 80, 70, 55
scikit-learn agrees: True
"""
# Copied by Professor Wendt from a note pinned to the plate box:
# I asked the machine to sort my nights into piles, and didn't say what a
# pile was. It made four. Three I recognised: clear, fog, gales. The
# fourth I still can't name, and it won't say. A.P.

import numpy as np
from sklearn.cluster import KMeans


def load_plate(path):
    return np.loadtxt(path, delimiter=",", skiprows=1)[:, 1:3]


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
    # Start from k different stars
    centres = initial_centres(points, k, rng)
    labels = None
    history = []
    for step in range(max_steps):
        # Assign each star to its nearest centre
        new_labels = assign(points, centres)
        history.append(inertia(points, new_labels, centres))
        # Stop when nothing changes
        if labels is not None and np.array_equal(new_labels, labels):
            break
        labels = new_labels
        # Move each centre to the middle of its stars
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
    stars = load_plate("plate.csv")
    rng = np.random.default_rng(10)

    # Try every k, best of 10
    inertias = {}
    groups = {}
    print("k   inertia")
    for k in range(1, 9):
        centres, labels, spread = best_of(stars, k, 10, rng)
        inertias[k] = spread
        groups[k] = labels
        print(f"{k}  {spread:8.0f}")

    # Choose k at the elbow
    chosen = choose_k(inertias)
    print(f"Chosen k: {chosen}")
    sizes = sorted(np.bincount(groups[chosen], minlength=chosen).tolist(), reverse=True)
    print("Stars in each group:", ", ".join(str(size) for size in sizes))

    # Check against scikit-learn
    library = KMeans(n_clusters=chosen, n_init=10, random_state=0).fit(stars)
    print(f"scikit-learn agrees: {abs(library.inertia_ - inertias[chosen]) < 0.001 * library.inertia_}")
