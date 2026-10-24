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


if __name__ == "__main__":
    stars = load_plate("plate.csv")
    rng = np.random.default_rng(10)

    # Try every k, best of 10

    # Choose k at the elbow

    # Check against scikit-learn
