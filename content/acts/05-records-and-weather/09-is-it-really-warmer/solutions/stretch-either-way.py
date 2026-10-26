import numpy as np


def difference(before, after):
    return np.mean(after) - np.mean(before)


def two_sided_p(before, after, rng, shuffles=10_000):
    """How often shuffling gives a difference at least as far from 0 as the real one, either way."""
    real = abs(difference(before, after))
    pooled = np.concatenate([before, after])
    size = len(before)
    as_far = 0
    for _ in range(shuffles):
        dealt = rng.permutation(pooled)
        if abs(difference(dealt[:size], dealt[size:])) >= real:
            as_far += 1
    return as_far / shuffles
