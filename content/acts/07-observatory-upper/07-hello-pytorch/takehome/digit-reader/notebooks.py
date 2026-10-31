"""The handwritten digits, split the same way as in the Digit Recogniser."""

# 1797 digits, each 8 by 8 greys from 0 (paper) to 16 (ink): the digits
# scikit-learn ships as load_digits (UCI, CC BY 4.0).
import numpy as np
from sklearn.datasets import load_digits


def load_split():
    """(X_learn, labels_learn, X_held_back, labels_held_back), as NumPy arrays.

    Each digit is a row of 64 greys from 0 to 1. The same 1500 digits to learn
    from and the same 297 held back as in the Handwritten Digit Recogniser.
    """
    digits = load_digits()
    X = digits.images.reshape(len(digits.images), 64) / 16
    labels = digits.target
    order = np.random.default_rng(0).permutation(len(X))
    learn, held_back = order[:1500], order[1500:]
    return X[learn], labels[learn], X[held_back], labels[held_back]
