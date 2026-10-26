"""Seeing: small filters slid over Penhallow's digits, and a brain that reads what they find."""

import numpy as np


# It watches the harbour mouth through the old camera on the hill, one
# small square at a time, every ten minutes, day and night. It has never
# once told me what it sees. I am not sure it would know how. A.P.
def convolve(image, kernel):
    """Slide kernel over image; at each place it fits, multiply and add. Shape (H - kh + 1, W - kw + 1)."""
    # How many places the window fits, down and across
    # At each place, the slice under the window
    # Multiply and add
    # Write it into the answer


def max_pool(feature, size=2):
    """The biggest number in each size by size block. Leftover rows and columns are dropped."""


def relu(z):
    return np.maximum(0, z)


def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()


def conv_layer(image, kernels, biases):
    """One feature map per kernel: convolve, add that kernel's bias, relu. Shape (k, H', W')."""


def forward(image, params):
    """Chances for each of the 10 digits, for one 8 by 8 image."""
    # Filters: one feature map per kernel
    # Pool each map
    # Flatten, filter by filter, into one row
    # Scores, then chances


if __name__ == "__main__":
    from filters import PARAMS
    from notebooks import load_notebook_digits

    images, labels = load_notebook_digits()
    images = images / 16
    held_back = np.random.default_rng(0).permutation(len(images))[1500:]

    maps = conv_layer(images[0], PARAMS["kernels"], PARAMS["kernel_biases"])
    pooled = np.array([max_pool(feature) for feature in maps])
    print(f"A digit {images[0].shape} becomes maps {maps.shape}, pooled to {pooled.shape}: "
          f"{pooled.size} numbers, then {len(forward(images[0], PARAMS))} chances")

    read = sum(int(forward(images[i], PARAMS).argmax() == labels[i]) for i in held_back)
    print(f"Read {read} of {len(held_back)} digits it had never seen")
