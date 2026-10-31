"""Aaesha's attention, with her test written before the code."""

import numpy as np


def softmax(scores, axis=-1):
    """Chances along one axis."""
    exps = np.exp(scores - scores.max(axis=axis, keepdims=True))
    return exps / exps.sum(axis=axis, keepdims=True)


def attention(Q, K, V, mask=None):
    """Scaled dot-product attention. Returns (output, weights)."""
    scores = Q @ K.T / np.sqrt(K.shape[-1])
    if mask is not None:
        scores = np.where(mask, -np.inf, scores)
    weights = softmax(scores, axis=-1)
    return weights @ V, weights


def check_weights(weights):
    """Aaesha's test. Each query shares its attention out over the keys,
    so it adds up to 1, and nothing above the diagonal looks ahead."""
    assert np.allclose(weights.sum(axis=1), 1), "every query's weights should add up to 1"
    assert np.all(weights[np.triu_indices(len(weights), k=1)] == 0), "nothing should look ahead"


if __name__ == "__main__":
    rng = np.random.default_rng(3)
    Q, K, V = rng.normal(size=(3, 3, 4))       # three characters, size 4
    future = np.triu(np.ones((3, 3), dtype=bool), k=1)

    output, weights = attention(Q, K, V, future)
    print(np.round(weights, 2))
    print("Rows add up to:   ", np.round(weights.sum(axis=1), 2))
    print("Columns add up to:", np.round(weights.sum(axis=0), 2))
    check_weights(weights)
    print("Every check passed.")
