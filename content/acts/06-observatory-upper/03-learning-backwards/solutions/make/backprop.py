"""Learning backwards: the small brain's gradients, checked, then trained."""

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


def numerical_gradient(f, array, step=1e-5):
    """The slope of f() for every entry of array, measured by nudging it. Pip's, fixed."""
    grad = np.zeros_like(array)
    for index in np.ndindex(array.shape):
        original = array[index]
        array[index] = original + step
        up = f()
        array[index] = original - step
        down = f()
        array[index] = original
        grad[index] = (up - down) / (2 * step)
    return grad


# When it gets one wrong, it works backwards to whichever of its numbers
# caused it, and fixes those. It does not need me to correct it.
# That was the point. A.P.
def backward(X, T, params, cache):
    """The gradient of the loss for every weight and bias, keyed like params."""
    Z1, H, P = cache["Z1"], cache["H"], cache["P"]
    # Start at the loss
    dP = 2 * (P - T) / P.size
    # Back through the sigmoid
    dZ2 = dP * P * (1 - P)
    # Layer two: the weights' share, the bias's share, the blame for H
    dW2 = H.T @ dZ2
    db2 = dZ2.sum(axis=0)
    dH = dZ2 @ params["W2"].T
    # Back through the relu
    dZ1 = dH * (Z1 > 0)
    # Layer one: the weights' share and the bias's share
    dW1 = X.T @ dZ1
    db1 = dZ1.sum(axis=0)
    return {"W1": dW1, "b1": db1, "W2": dW2, "b2": db2}


def check_gradients(X, T, params):
    """For each of W1, b1, W2, b2: does backward agree with the measurement?"""
    # Work out every gradient with backward
    P, cache = forward(X, params)
    grads = backward(X, T, params, cache)

    def current_loss():
        return loss(forward(X, params)[0], T)

    # Measure each one by nudging, and compare
    results = {}
    for name in params:
        measured = numerical_gradient(current_loss, params[name])
        results[name] = bool(np.allclose(grads[name], measured))
    return results


def train(X, T, params, rate, steps):
    """Gradient descent. Changes params in place; returns the loss at each step."""
    losses = []
    for _ in range(steps):
        # For each step: forward, note the loss, backward
        P, cache = forward(X, params)
        losses.append(loss(P, T))
        grads = backward(X, T, params, cache)
        # Move every weight against its gradient
        for name in params:
            params[name] -= rate * grads[name]
    return losses


if __name__ == "__main__":
    # Captain Ferro's crossings: flood tide?, sea breeze?
    crossings = np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]])
    sails = np.array([[1.0], [0.0], [0.0], [1.0]])

    rng = np.random.default_rng(2)
    params = {
        "W1": rng.normal(0, 1, (2, 4)),
        "b1": np.full(4, 0.1),
        "W2": rng.normal(0, 1, (4, 1)),
        "b2": np.zeros(1),
    }

    for name, ok in check_gradients(crossings, sails, params).items():
        print(f"{name}: {'ok' if ok else 'WRONG'}")

    losses = train(crossings, sails, params, rate=2.0, steps=1000)
    print(f"Loss: {losses[0]:.4f} at the start, {losses[-1]:.4f} at the end")
    chances, _ = forward(crossings, params)
    print("Sails:", (chances.ravel() > 0.5).astype(int))
