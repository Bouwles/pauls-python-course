"""Seeing: small filters slid over the digits, and a network that reads what they find."""

import numpy as np


def convolve(image, kernel):
    """Slide kernel over image; at each place it fits, multiply and add. Shape (H - kh + 1, W - kw + 1)."""
    # How many places the window fits, down and across
    rows = image.shape[0] - kernel.shape[0] + 1
    cols = image.shape[1] - kernel.shape[1] + 1
    out = np.zeros((rows, cols))
    for i in range(rows):
        for j in range(cols):
            # At each place, the slice under the window
            window = image[i:i + kernel.shape[0], j:j + kernel.shape[1]]
            # Multiply and add
            # Write it into the answer
            out[i, j] = np.sum(window * kernel)
    return out


def max_pool(feature, size=2):
    """The biggest number in each size by size block. Leftover rows and columns are dropped."""
    rows = feature.shape[0] // size
    cols = feature.shape[1] // size
    out = np.zeros((rows, cols))
    for i in range(rows):
        for j in range(cols):
            out[i, j] = feature[i * size:(i + 1) * size, j * size:(j + 1) * size].max()
    return out


def relu(z):
    return np.maximum(0, z)


def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()


def conv_layer(image, kernels, biases):
    """One feature map per kernel: convolve, add that kernel's bias, relu. Shape (k, H', W')."""
    return np.array([relu(convolve(image, kernel) + bias) for kernel, bias in zip(kernels, biases)])


def forward(image, params):
    """Chances for each of the 10 digits, for one 8 by 8 image."""
    # Filters: one feature map per kernel
    maps = conv_layer(image, params["kernels"], params["kernel_biases"])
    # Pool each map
    pooled = np.array([max_pool(feature) for feature in maps])
    # Flatten, filter by filter, into one row
    row = pooled.ravel()
    # Scores, then chances
    return softmax(row @ params["W"] + params["b"])


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
