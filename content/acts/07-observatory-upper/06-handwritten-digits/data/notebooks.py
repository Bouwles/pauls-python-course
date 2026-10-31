"""The handwritten digits: 8 by 8 scans, greys from 0 (paper) to 16 (ink)."""

# 1797 real handwritten digits, each scanned onto an 8 by 8 grid of greys.
# They are the digits scikit-learn ships as load_digits (UCI, CC BY 4.0).
from sklearn.datasets import load_digits


def load_notebook_digits():
    """The images, shape (1797, 8, 8), and the digit each one is, shape (1797,)."""
    digits = load_digits()
    return digits.images, digits.target
