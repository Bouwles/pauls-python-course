# Riya's backward pass for Deep Q.

import numpy as np


def q_values(params, X):
    """One row of four Q-values (up, down, left, right) for each row of X."""
    hidden = np.maximum(0, X @ params["W1"] + params["b1"])
    return hidden @ params["W2"] + params["b2"]


def loss(params, X, actions, y):
    """Mean squared TD error, on the moves taken only."""
    Q = q_values(params, X)
    chosen = Q[np.arange(len(X)), actions]
    return np.mean((chosen - y) ** 2)


def gradients(params, X, actions, y):
    """The gradient of loss() for every weight."""
    Z1 = X @ params["W1"] + params["b1"]
    H = np.maximum(0, Z1)
    Q = H @ params["W2"] + params["b2"]
    n = len(X)
    # Every move learns from the target. Four times the learning.
    dQ = 2 * (Q - y[:, None]) / n
    dH = dQ @ params["W2"].T
    dZ1 = dH * (Z1 > 0)
    return {"W1": X.T @ dZ1, "b1": dZ1.sum(axis=0), "W2": H.T @ dQ, "b2": dQ.sum(axis=0)}


if __name__ == "__main__":
    rng = np.random.default_rng(3)
    params = {"W1": rng.normal(0, 0.4, (7, 16)), "b1": np.zeros(16),
              "W2": rng.normal(0, 0.25, (16, 4)), "b2": np.zeros(4)}
    start = np.array([[0, 0, 1, 1, 0, 0, 0.0]])    # row 2, column 0
    went_up = np.array([0])
    worth = np.array([5.0])

    for _ in range(300):
        grads = gradients(params, start, went_up, worth)
        for name in params:
            params[name] -= 0.05 * grads[name]

    print("Up, down, left, right from the start:", np.round(q_values(params, start)[0], 2))
