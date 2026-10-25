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
from collections import Counter

import numpy as np

from tools import fit_scaler, load_evenings, scale, train_test_split

KS = [1, 3, 5, 7, 9, 11, 15, 21]
TONIGHT = [91.0, 0.4, 2.0, 1018.0]


def distances(X, point, metric="euclidean"):
    differences = X - point
    if metric == "manhattan":
        return np.abs(differences).sum(axis=1)
    return np.sqrt((differences ** 2).sum(axis=1))


def nearest(X, point, k, metric="euclidean"):
    return np.argsort(distances(X, point, metric), kind="stable")[:k]


def vote(labels):
    return Counter(labels).most_common(1)[0][0]


def predict(X_train, labels, X_new, k, metric="euclidean"):
    return np.array([vote(labels[nearest(X_train, point, k, metric)]) for point in X_new])


def accuracy(labels, predicted):
    return np.mean(np.asarray(labels) == np.asarray(predicted))


def choose_k(X_train, labels, X_val, val_labels, ks):
    scores = [accuracy(val_labels, predict(X_train, labels, X_val, k)) for k in ks]
    return ks[int(np.argmax(scores))]


if __name__ == "__main__":
    X, sky = load_evenings("evenings.csv")

    # Lock the test evenings away, then keep some back for validation
    rng = np.random.default_rng(6)
    X_rest, X_test, sky_rest, sky_test = train_test_split(X, sky, 0.2, rng)
    X_train, X_val, sky_train, sky_val = train_test_split(X_rest, sky_rest, 0.25, rng)

    # Scale with the training evenings' ruler
    means, spreads = fit_scaler(X_train)
    X_train = scale(X_train, means, spreads)
    X_val = scale(X_val, means, spreads)
    X_test = scale(X_test, means, spreads)

    # For each k, score training and validation
    print(" k  training  validation")
    for k in KS:
        training = accuracy(sky_train, predict(X_train, sky_train, X_train, k))
        validation = accuracy(sky_val, predict(X_train, sky_train, X_val, k))
        print(f"{k:2}  {training:8.3f}  {validation:10.3f}")

    # Choose by validation, then open the test evenings once
    k = choose_k(X_train, sky_train, X_val, sky_val, KS)
    print(f"Chosen k: {k}")
    print(f"Test accuracy: {accuracy(sky_test, predict(X_train, sky_train, X_test, k)):.2f}")

    # Find the nights most like tonight, and let them vote
    tonight = scale(np.array(TONIGHT), means, spreads)
    neighbours = sky_train[nearest(X_train, tonight, k)]
    forecast = vote(neighbours)
    print(f"Tonight: {forecast}, like {np.sum(neighbours == forecast)} of the {k} nearest nights")
