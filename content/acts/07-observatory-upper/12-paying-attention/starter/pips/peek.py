"""Pip's attention. Every column adds up to 1. Very tidy."""

import numpy as np


def softmax(scores, axis=-1):
    """Chances along one axis."""
    exps = np.exp(scores - scores.max(axis=axis, keepdims=True))
    return exps / exps.sum(axis=axis, keepdims=True)


def attention(Q, K, V, mask=None):
    """Scaled dot-product attention. Returns (output, weights)."""
    scores = Q @ K.T / K.shape[-1]
    if mask is not None:
        scores = np.where(mask, -np.inf, scores)
    weights = softmax(scores, axis=0)
    return weights @ V, weights


if __name__ == "__main__":
    rng = np.random.default_rng(3)
    Q, K, V = rng.normal(size=(3, 3, 4))       # three characters, size 4
    future = np.triu(np.ones((3, 3), dtype=bool), k=1)

    output, weights = attention(Q, K, V, future)
    print(np.round(weights, 2))
    print("Rows add up to:   ", np.round(weights.sum(axis=1), 2))
    print("Columns add up to:", np.round(weights.sum(axis=0), 2))
