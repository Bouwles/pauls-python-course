"""Pip's gradient checker: nudge each entry, measure how the loss moves."""

import numpy as np


def numerical_gradient(f, array, step=1e-5):
    """The slope of f() for every entry of array, measured by nudging it."""
    grad = np.zeros_like(array)
    for index in np.ndindex(array.shape):
        original = array[index]
        array[index] = original + step
        up = f()
        array[index] = original - step
        down = f()
        grad[index] = (up - down) / step
    return grad


if __name__ == "__main__":
    weights = np.array([[1.0, -2.0], [0.5, 3.0]])
    by_hand = 2 * weights                 # the slope of a square is twice the number

    def squares():
        return np.sum(weights ** 2)

    print("By hand: ", by_hand.tolist())
    print("Measured:", numerical_gradient(squares, weights).round(4).tolist())
    print("Weights after:", weights.tolist())
