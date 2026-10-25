"""Pip's softmax: a row of scores for each digit, into chances."""

import numpy as np


def softmax(Z):
    """Each row of scores into chances that add up to 1, however big the scores."""
    exps = np.exp(Z - Z.max())
    return exps / exps.sum(axis=0)


if __name__ == "__main__":
    scores = np.array([[2.0, 1.0, 0.0],
                       [0.0, 3.0, 1.0]])
    chances = softmax(scores)
    print(np.round(chances, 3))
    print("Each row adds up to:", np.round(chances.sum(axis=1), 3))
