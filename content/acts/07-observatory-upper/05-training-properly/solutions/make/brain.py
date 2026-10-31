"""Neil's network, from Neural Network from Scratch: forward, loss and backward."""

import numpy as np


def relu(z):
    return np.maximum(0, z)


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def forward(X, params):
    """The brain's answers for X, and the values backward will need."""
    Z1 = X @ params["W1"] + params["b1"]
    H = relu(Z1)
    P = sigmoid(H @ params["W2"] + params["b2"])
    return P, {"Z1": Z1, "H": H, "P": P}


def loss(P, T):
    """Mean squared error over every answer."""
    return np.mean((P - T) ** 2)


def backward(X, T, params, cache):
    """The gradient of the loss for every weight and bias, keyed like params."""
    Z1, H, P = cache["Z1"], cache["H"], cache["P"]
    dZ2 = 2 * (P - T) / P.size * P * (1 - P)
    dH = dZ2 @ params["W2"].T
    dZ1 = dH * (Z1 > 0)
    return {"W1": X.T @ dZ1, "b1": dZ1.sum(axis=0), "W2": H.T @ dZ2, "b2": dZ2.sum(axis=0)}


# Shuffled every epoch. Shown the evenings in the same order every time, a
# network can learn the order instead of the evenings.
def batches(X, T, size, rng):
    """Shuffle the rows, then give back (X, T) for each batch of `size` rows in turn."""
    order = rng.permutation(len(X))
    for start in range(0, len(X), size):
        rows = order[start:start + size]
        yield X[rows], T[rows]
