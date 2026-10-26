"""Iris and Penguins Classifier: the species of an animal or a flower, from its
measurements, by k nearest neighbours written from scratch.

distances(X, point, metric="euclidean")
        one distance from point to each row of X: straight-line distance, or
        with metric="manhattan", the sum of the plain differences
nearest(X, point, k, metric="euclidean")
        the positions of the k rows nearest to point, nearest first; rows
        at the same distance keep their order (np.argsort(..., kind="stable"))
vote(labels)
        the most common label; on a tie, the tied label that comes first,
        which is the one with the nearest neighbour
predict(X_train, labels, X_new, k, metric="euclidean")
        an array with one answer for each row of X_new: the vote of its
        k nearest training rows
accuracy(labels, predicted)
        the share of answers that match
choose_k(X_train, labels, X_val, val_labels, ks)
        the k from ks with the best validation accuracy; on a tie, the first

Run as a program, it loads DATASET with load_table from tools.py, uses
rng = np.random.default_rng(35) to lock a fifth of the rows away for testing,
then a quarter of the rest for validation (train_test_split, twice), scales
all three with the training rows' means and spreads, prints the validation
table for each k in KS, chooses k, tests once, and names the species of NEW:
penguins.csv: 342 rows, flipper_length, body_mass, 3 species
 k  training  validation
 1     0.966       0.721
 3     0.879       0.779
 5     0.854       0.838
 7     0.830       0.838
 9     0.796       0.868
11     0.796       0.853
15     0.796       0.853
21     0.791       0.809
Chosen k: 9
Test accuracy: 0.81
New: Gentoo, like 8 of the 9 nearest
"""
from collections import Counter

import numpy as np

from tools import fit_scaler, load_table, scale, train_test_split

DATASET = "penguins.csv"
MEASUREMENTS = ["flipper_length", "body_mass"]
NEW = [213.0, 4900.0]
KS = [1, 3, 5, 7, 9, 11, 15, 21]


if __name__ == "__main__":
    X, species = load_table(DATASET, MEASUREMENTS)
    print(f"{DATASET}: {len(X)} rows, {', '.join(MEASUREMENTS)}, {len(set(species))} species")

    # Lock the test rows away, then keep some back for validation

    # Scale with the training rows' ruler

    # For each k, score training and validation

    # Choose by validation, then open the test rows once

    # Find the rows most like the new one, and let them vote
