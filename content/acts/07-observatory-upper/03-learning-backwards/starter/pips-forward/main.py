import numpy as np


def relu(z):
    return np.max(0, z)


def sigmoid(z):
    return 1 / 1 + np.exp(-z)


def forward(evenings, W1, b1, W2, b2):
    hidden = relu(evenings @ W1 + b1)
    return sigmoid(hidden @ W2 + b2)


if __name__ == "__main__":
    # Two evenings, two readings each, through a 2-2-1 brain
    evenings = np.array([[1.0, 2.0], [0.0, 1.0]])
    W1 = np.array([[1.0, -1.0], [0.5, 1.0]])
    b1 = np.array([0.0, -2.5])
    W2 = np.array([[0.5], [3.0]])
    b2 = np.array([-1.0])
    print(np.round(forward(evenings, W1, b1, W2, b2), 3))
