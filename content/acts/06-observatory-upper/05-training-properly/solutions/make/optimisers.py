"""Training properly: a good start, and three ways downhill."""

import copy

import numpy as np

from brain import backward, batches, forward, loss


def init_params(n_in, n_hidden, n_out, rng):
    """Small random weights, scaled to each layer's inputs; every bias at 0."""
    # W1 first: spread np.sqrt(2 / n_in), for the relu layer
    W1 = rng.normal(0, np.sqrt(2 / n_in), (n_in, n_hidden))
    # Then W2: spread np.sqrt(1 / n_hidden), for the sigmoid layer
    W2 = rng.normal(0, np.sqrt(1 / n_hidden), (n_hidden, n_out))
    # Every bias at 0
    return {"W1": W1, "b1": np.zeros(n_hidden), "W2": W2, "b2": np.zeros(n_out)}


class SGD:
    """Plain gradient descent: every weight moves against its gradient."""

    def __init__(self, rate):
        self.rate = rate

    def step(self, params, grads):
        for name in params:
            params[name] -= self.rate * grads[name]


class Momentum:
    """Gradient descent that keeps most of its last step."""

    def __init__(self, rate, beta=0.9):
        self.rate = rate
        self.beta = beta
        self.velocity = {}

    def step(self, params, grads):
        """Move every weight in params, using its gradient in grads."""
        for name in params:
            # A velocity for every weight, starting at 0
            if name not in self.velocity:
                self.velocity[name] = np.zeros_like(params[name])
            # Keep most of the last step, add the new slope
            self.velocity[name] = self.beta * self.velocity[name] + grads[name]
            # Step by the velocity
            params[name] -= self.rate * self.velocity[name]


class Adam:
    """A step for each weight of its own, from running averages of its gradient."""

    def __init__(self, rate=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
        self.rate = rate
        self.beta1 = beta1
        self.beta2 = beta2
        self.eps = eps
        self.m = {}
        self.v = {}
        self.t = 0

    def step(self, params, grads):
        """Move every weight in params, using its gradient in grads."""
        # Count the step
        self.t += 1
        for name in params:
            g = grads[name]
            # Running averages of the gradient and its square, starting at 0
            m = self.beta1 * self.m.get(name, np.zeros_like(g)) + (1 - self.beta1) * g
            v = self.beta2 * self.v.get(name, np.zeros_like(g)) + (1 - self.beta2) * g ** 2
            self.m[name], self.v[name] = m, v
            # Undo their slow start
            m_hat = m / (1 - self.beta1 ** self.t)
            v_hat = v / (1 - self.beta2 ** self.t)
            # Step each weight by its own amount
            params[name] -= self.rate * m_hat / (np.sqrt(v_hat) + self.eps)


def train(X, T, params, optimiser, epochs, batch_size, rng):
    """Mini-batch training. Changes params in place; returns the loss on all of X after each epoch."""
    losses = []
    # For each epoch, for each batch:
    for _ in range(epochs):
        for X_batch, T_batch in batches(X, T, batch_size, rng):
            # forward and backward on the batch alone
            P, cache = forward(X_batch, params)
            grads = backward(X_batch, T_batch, params, cache)
            # let the optimiser take the step
            optimiser.step(params, grads)
        # At the end of the epoch, note the loss on every row
        losses.append(loss(forward(X, params)[0], T))
    return losses


def report(name, X, T, params, losses):
    P, _ = forward(X, params)
    right = np.mean(np.all((P > 0.5) == (T > 0.5), axis=1))
    print(f"{name:<9} loss {losses[-1]:.4f}, every answer right on {right:.0%} of evenings")


if __name__ == "__main__":
    log = np.loadtxt("evenings.csv", delimiter=",", skiprows=1)
    X, T = log[:, :4], log[:, 4:]          # visibility, wind, tide, dark; lamp, horn, gate

    start = init_params(4, 16, 3, np.random.default_rng(6))
    print("From small random weights, 30 epochs in batches of 32:")
    for name, optimiser in [("sgd", SGD(0.5)), ("momentum", Momentum(0.5)), ("adam", Adam(0.05))]:
        params = copy.deepcopy(start)
        losses = train(X, T, params, optimiser, 30, 32, np.random.default_rng(0))
        report(name, X, T, params, losses)

    print("From every weight at 0:")
    params = {name: np.zeros_like(weights) for name, weights in start.items()}
    losses = train(X, T, params, Adam(0.05), 30, 32, np.random.default_rng(0))
    report("adam", X, T, params, losses)
