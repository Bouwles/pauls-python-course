"""Penhallow's small brain, copied from her notebook by Professor Wendt."""

import numpy as np

# Readings, each from 0 to 1: visibility, wind, tide, dark.
# Layer one: 4 readings in, 5 hidden neurons out.
W1 = np.array([
    [0.04, -1.12, 0.03, 0.95, -0.02],
    [-0.03, 0.05, 0.91, -0.04, 1.08],
    [0.02, -0.01, 1.03, 0.06, 0.01],
    [1.21, 0.02, -0.05, 0.03, -0.01],
])
b1 = np.array([-0.58, 0.66, -1.27, -0.79, -0.74])

# Layer two. Three outputs: the lamp, the horn, the gate. Tom's, Tom's
# again, and the sea wall's. Every evening I logged, it watched what I
# did. It is learning the town. It is not yet learning why. A.P.
W2 = np.array([
    [9.8, -0.4, 0.2],
    [8.7, 12.9, -0.3],
    [-0.2, 0.3, 11.4],
    [-1.1, -2.6, -0.1],
    [0.4, 0.1, 7.9],
])
b2 = np.array([-2.3, -3.1, -2.6])

ANSWERS = ["lamp", "horn", "gate"]


def relu(z):
    """Negative numbers become 0; the rest pass straight through."""


def sigmoid(z):
    """Squash any number into the range 0 to 1."""


def forward(evenings, W1, b1, W2, b2):
    """One row of answers for each row of readings."""
    # Layer one: multiply, add the bias, bend
    # Layer two: multiply, add the bias, squash


def decisions(outputs):
    """For each evening, the names of the answers above 0.5."""


if __name__ == "__main__":
    # Four evenings from Penhallow's log: visibility, wind, tide, dark
    evenings = np.array([
        [0.9, 0.2, 0.5, 1.0],
        [0.2, 0.3, 0.4, 0.0],
        [0.7, 0.9, 0.9, 1.0],
        [1.0, 0.1, 0.3, 0.0],
    ])
    outputs = forward(evenings, W1, b1, W2, b2)
    for number, names in enumerate(decisions(outputs), start=1):
        print(f"Evening {number}: {', '.join(names) or 'nothing'}")
