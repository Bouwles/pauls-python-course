"""Paul's copy of the useful parts of the Optimiser Benchmark."""

import numpy as np


def init_params(n_in, n_hidden, n_out, rng):
    """Small random weights, scaled to each layer's inputs; every bias at 0."""
    W1 = rng.normal(0, np.sqrt(2 / n_in), (n_in, n_hidden))
    W2 = rng.normal(0, np.sqrt(1 / n_hidden), (n_hidden, n_out))
    return {"W1": W1, "b1": np.zeros(n_hidden), "W2": W2, "b2": np.zeros(n_out)}


def batches(X, labels, size, rng):
    """Shuffle the rows, then give back (X, labels) for each batch of `size` rows in turn."""
    order = rng.permutation(len(X))
    for start in range(0, len(X), size):
        rows = order[start:start + size]
        yield X[rows], labels[rows]


class SGD:
    """Plain gradient descent."""

    def __init__(self, rate):
        self.rate = rate

    def step(self, params, grads):
        for name in params:
            params[name] -= self.rate * grads[name]


class Adam:
    """A step for each weight of its own, from running averages of its gradient."""

    def __init__(self, rate=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
        self.rate, self.beta1, self.beta2, self.eps = rate, beta1, beta2, eps
        self.m, self.v, self.t = {}, {}, 0

    def step(self, params, grads):
        self.t += 1
        for name in params:
            g = grads[name]
            self.m[name] = self.beta1 * self.m.get(name, np.zeros_like(g)) + (1 - self.beta1) * g
            self.v[name] = self.beta2 * self.v.get(name, np.zeros_like(g)) + (1 - self.beta2) * g ** 2
            m_hat = self.m[name] / (1 - self.beta1 ** self.t)
            v_hat = self.v[name] / (1 - self.beta2 ** self.t)
            params[name] -= self.rate * m_hat / (np.sqrt(v_hat) + self.eps)
