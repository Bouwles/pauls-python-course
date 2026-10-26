"""Pip's batches: every evening once an epoch, a handful at a time, shuffled."""

import numpy as np


def batches(X, T, size, rng):
    """Shuffle the rows, then give back (X, T) for each batch of `size` rows in turn."""
    rng.shuffle(X)
    rng.shuffle(T)
    for start in range(0, len(X) - size, size):
        yield X[start:start + size], T[start:start + size]


if __name__ == "__main__":
    # Eight evenings, numbered so you can tell them apart. Each answer is its evening times ten.
    evenings = np.arange(1, 9).reshape(8, 1)
    answers = evenings * 10
    rng = np.random.default_rng(4)
    for X_batch, T_batch in batches(evenings, answers, 3, rng):
        print("Evenings", X_batch.ravel(), "answers", T_batch.ravel())
