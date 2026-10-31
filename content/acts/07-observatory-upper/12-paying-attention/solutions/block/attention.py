"""Self-attention: every character asks the ones before it a question."""

import numpy as np


def softmax(scores):
    """Chances along the last axis: each row adds up to 1."""
    exps = np.exp(scores - scores.max(axis=-1, keepdims=True))
    return exps / exps.sum(axis=-1, keepdims=True)


def causal_mask(n):
    """An n by n array of booleans: True where a query would be looking ahead."""
    return np.triu(np.ones((n, n), dtype=bool), k=1)


def attention(Q, K, V, mask=None):
    """Scaled dot-product attention. Returns (output, weights)."""
    # Score: every query against every key
    scores = Q @ K.T / np.sqrt(K.shape[-1])
    # Hide what a query mustn't see
    if mask is not None:
        scores = np.where(mask, -np.inf, scores)
    # Softmax the scores into weights, one row per query
    weights = softmax(scores)
    # Mix the values by the weights
    return weights @ V, weights


def self_attention(X, Wq, Wk, Wv, causal=True):
    """Queries, keys and values all made from X, then attention. Returns (output, weights)."""
    Q, K, V = X @ Wq, X @ Wk, X @ Wv
    mask = causal_mask(len(X)) if causal else None
    return attention(Q, K, V, mask)


if __name__ == "__main__":
    # Four characters of "fog.", each as 3 numbers; one head of size 2
    X = np.array([[1.0, 0.0, 0.5], [0.0, 1.0, 0.5], [1.0, 1.0, 0.0], [0.0, 0.0, 1.0]])
    Wq = np.array([[1.0, 0.0], [0.0, 1.0], [0.5, 0.5]])
    Wk = np.array([[0.0, 1.0], [1.0, 0.0], [0.5, 0.5]])
    Wv = np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])

    output, weights = self_attention(X, Wq, Wk, Wv)
    print("Weights, one row per character:")
    print(np.round(weights, 2))
    print("Rows add up to:", np.round(weights.sum(axis=1), 2))
    print("Output:", output.shape)
    print(np.round(output, 2))
