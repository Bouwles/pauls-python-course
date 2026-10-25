"""Tonight's sky, forecast from the nights in Penhallow's notebook most like it.

distances(X, point, metric="euclidean")
        one distance from point to each row of X: straight-line distance, or
        with metric="manhattan", the sum of the plain differences
nearest(X, point, k, metric="euclidean")
        the positions of the k rows nearest to point, nearest first; rows
        at the same distance keep their order (np.argsort(..., kind="stable"))
vote(labels)
        the most common label; on a tie, the tied label that comes first,
        which is the one with the nearest night
predict(X_train, labels, X_new, k, metric="euclidean")
        an array with one forecast for each row of X_new: the vote of its
        k nearest training rows
accuracy(labels, predicted)
        the share of forecasts that match
choose_k(X_train, labels, X_val, val_labels, ks)
        the k from ks with the best validation accuracy; on a tie, the first

Run as a program, it uses rng = np.random.default_rng(6) to lock a fifth of
the evenings away for testing, then a quarter of the rest for validation
(train_test_split from tools.py, twice), scales all three with the training
evenings' means and spreads, and prints, for each k in KS:
 k  training  validation
 1     1.000       0.792
 3     0.889       0.771
...
21     0.833       0.833
Chosen k: 9
Test accuracy: 0.77
Tonight: fog, like 6 of the 9 nearest nights
"""
import numpy as np

from tools import fit_scaler, load_evenings, scale, train_test_split

KS = [1, 3, 5, 7, 9, 11, 15, 21]
TONIGHT = [91.0, 0.4, 2.0, 1018.0]


if __name__ == "__main__":
    X, sky = load_evenings("evenings.csv")

    # Lock the test evenings away, then keep some back for validation

    # Scale with the training evenings' ruler

    # For each k, score training and validation

    # Choose by validation, then open the test evenings once

    # Find the nights most like tonight, and let them vote
