"""Wendt's scans of the digits in Penhallow's notebooks."""

# 1797 digits, each scanned onto an 8 by 8 grid of greys, from 0 (paper)
# to 16 (ink). They are, Wendt admits, the same digits scikit-learn ships
# as load_digits. She says that's a coincidence. Nobody believes her.
from sklearn.datasets import load_digits


def load_notebook_digits():
    """The images, shape (1797, 8, 8), and the digit each one is, shape (1797,)."""
    digits = load_digits()
    return digits.images, digits.target
