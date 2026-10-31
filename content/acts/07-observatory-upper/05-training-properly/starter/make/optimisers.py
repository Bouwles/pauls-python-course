"""Training properly: a good start, and three ways downhill."""

import copy

import numpy as np

from brain import backward, batches, forward, loss


def init_params(n_in, n_hidden, n_out, rng):
    """Small random weights, scaled to each layer's inputs; every bias at 0."""
    # W1 first: spread np.sqrt(2 / n_in), for the relu layer
    # Then W2: spread np.sqrt(1 / n_hidden), for the sigmoid layer
    # Every bias at 0


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

    def step(self, params, grads):
        """Move every weight in params, using its gradient in grads."""
        # A velocity for every weight, starting at 0
        # Keep most of the last step, add the new slope
        # Step by the velocity


class Adam:
    """A step for each weight of its own, from running averages of its gradient."""

    def __init__(self, rate=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
        self.rate = rate
        self.beta1 = beta1
        self.beta2 = beta2
        self.eps = eps

    def step(self, params, grads):
        """Move every weight in params, using its gradient in grads."""
        # Count the step
        # Running averages of the gradient and its square, starting at 0
        # Undo their slow start
        # Step each weight by its own amount


def train(X, T, params, optimiser, epochs, batch_size, rng):
    """Mini-batch training. Changes params in place; returns the loss on all of X after each epoch."""
    # For each epoch, for each batch:
    #     forward and backward on the batch alone
    #     let the optimiser take the step
    # At the end of the epoch, note the loss on every row


def report(name, X, T, params, losses):
    P, _ = forward(X, params)
    right = np.mean(np.all((P > 0.5) == (T > 0.5), axis=1))
    print(f"{name:<9} loss {losses[-1]:.4f}, every answer right on {right:.0%} of evenings")


if __name__ == "__main__":
    log = np.loadtxt("evenings.csv", delimiter=",", skiprows=1)
    X, T = log[:, :4], log[:, 4:]          # visibility, wind, rain, dark; lights, beacon, shutters

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
