"""Every hidden neuron on the same scale, whatever the readings were measured in."""

import numpy as np


def standardise(Z):
    """Each column of Z brought to mean 0 and standard deviation 1, using this batch's own numbers."""
    mean = Z.mean(axis=0)
    var = Z.var(axis=0)
    return (Z - mean) / np.sqrt(var + 1e-5)


if __name__ == "__main__":
    # Four evenings straight from the log: visibility in metres, wind in knots
    evenings = np.array([[3000.0, 12.0], [200.0, 30.0], [50.0, 2.0], [1500.0, 18.0]])
    W1 = np.array([[0.002, -0.001, 0.0005], [0.1, 0.3, -0.2]])
    Z = evenings @ W1

    print("Before:", np.round(Z.mean(axis=0), 2), np.round(Z.std(axis=0), 2))
    out = standardise(Z)
    print("After: ", np.round(out.mean(axis=0), 2) + 0.0, np.round(out.std(axis=0), 2))
