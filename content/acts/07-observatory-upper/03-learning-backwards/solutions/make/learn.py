"""Teaching the network: backpropagation, checked against measurement, then gradient descent."""

import numpy as np

from network import decisions, forward


def loss(P, T):
    """Mean squared error over every answer."""
    return np.mean((P - T) ** 2)


def numerical_gradient(f, array, step=1e-5):
    """The slope of f() for every entry of array, measured by nudging it. Aaesha's, fixed."""
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
# caused it, and fixes those.
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
    log = np.loadtxt("evenings.csv", delimiter=",", skiprows=1)
    X, T = log[:, :4], log[:, 4:]          # visibility, wind, rain, dark; lights, beacon, shutters
    X_learn, T_learn = X[:600], T[:600]
    X_new, T_new = X[600:], T[600:]        # 200 evenings it never sees until the end

    rng = np.random.default_rng(1)
    params = {
        "W1": rng.normal(0, 1, (4, 8)),
        "b1": np.full(8, 0.1),
        "W2": rng.normal(0, 1, (8, 3)),
        "b2": np.zeros(3),
    }

    checks = check_gradients(X_learn, T_learn, params)
    print("Gradients:", ", ".join(f"{name} {'ok' if ok else 'WRONG'}" for name, ok in checks.items()))

    losses = train(X_learn, T_learn, params, rate=5.0, steps=3000)
    print(f"Loss: {losses[0]:.4f} at the start, {losses[-1]:.4f} at the end")

    P, _ = forward(X_new, params)
    right = int(np.all((P > 0.5) == (T_new > 0.5), axis=1).sum())
    print(f"All three right on {right} of {len(X_new)} evenings it never saw")

    tonight = np.array([[0.15, 0.8, 0.9, 1.0]])    # thick fog, a gale, heavy rain, dark
    P, _ = forward(tonight, params)
    print(f"Tonight: {', '.join(decisions(P)[0]) or 'nothing'}")
