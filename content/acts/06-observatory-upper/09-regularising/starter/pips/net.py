"""Wendt's copy of the seeing network: six readings in, the seeing out, in arcseconds."""

import csv

import numpy as np

READINGS = ["wind", "jet", "humidity", "cooling", "moon", "pressure"]


def load_nights(path="seeing.csv", learn=24):
    """Penhallow's nights: the first `learn` to learn from, the rest to check on."""
    with open(path) as nights_file:
        rows = list(csv.DictReader(nights_file))
    X = np.array([[float(row[name]) for name in READINGS] for row in rows])
    T = np.array([[float(row["seeing"])] for row in rows])
    return X[:learn], T[:learn], X[learn:], T[learn:]


def init_params(inputs, hidden, seed=0):
    """Small random weights: one hidden layer of `hidden` ReLU neurons, one answer."""
    rng = np.random.default_rng(seed)
    return {
        "W1": rng.normal(0, np.sqrt(2 / inputs), (inputs, hidden)),
        "b1": np.zeros(hidden),
        "W2": rng.normal(0, np.sqrt(1 / hidden), (hidden, 1)),
        "b2": np.full(1, 2.0),
    }


def forward(X, params, keep=None):
    """The seeing for each row of X. `keep`, if given, multiplies the hidden layer: a dropout mask."""
    Z1 = X @ params["W1"] + params["b1"]
    H = np.maximum(0, Z1)
    if keep is not None:
        H = H * keep
    P = H @ params["W2"] + params["b2"]
    return P, {"Z1": Z1, "H": H, "P": P, "keep": keep}


def backward(X, T, params, cache):
    """The gradient of the mean squared error for every weight and bias, keyed like params."""
    Z1, H, P, keep = cache["Z1"], cache["H"], cache["P"], cache["keep"]
    dP = 2 * (P - T) / P.size
    dW2 = H.T @ dP
    db2 = dP.sum(axis=0)
    dH = dP @ params["W2"].T
    if keep is not None:
        dH = dH * keep
    dZ1 = dH * (Z1 > 0)
    return {"W1": X.T @ dZ1, "b1": dZ1.sum(axis=0), "W2": dW2, "b2": db2}


def mse(P, T):
    """Mean squared error, as a plain float."""
    return float(np.mean((P - T) ** 2))
