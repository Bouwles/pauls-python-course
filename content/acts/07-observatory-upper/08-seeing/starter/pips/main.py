"""Riya's convolution: slide the kernel over the picture, multiply and add."""

import numpy as np


def convolve(image, kernel):
    """Slide kernel over image; at each place it fits, multiply and add."""
    size = len(kernel)
    rows = len(image) - size
    cols = len(image[0]) - size
    out = np.zeros((rows, cols))
    for i in range(rows):
        for j in range(cols):
            out[i, j] = np.sum(image[i:i + size, j:j + size] * kernel)
    return out


if __name__ == "__main__":
    # The Clocktower from the street: dark sky is 0, the tower is 1
    image = np.array([[0, 0, 1, 1, 0],
                      [0, 0, 1, 1, 0],
                      [0, 0, 1, 1, 0],
                      [0, 0, 1, 1, 0]])
    kernel = np.array([[-1, 1],
                       [-1, 1]])
    print(convolve(image, kernel))
