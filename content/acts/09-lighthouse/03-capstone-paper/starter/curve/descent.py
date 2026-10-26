"""The pieces of a random-features model, as in Belkin, Hsu, Ma and Mandal (2019).

relu_features(X, W)
        the random features relu(X @ W): one row per example, one column per
        feature, so shape (len(X), W.shape[1])
fit_min_norm(features, y)
        the weights that fit best and, among those, have the smallest norm:
        ordinary least squares when there are fewer features than examples,
        and the smallest exact fit when there are more. Shape (features.shape[1],)
mse(predicted, actual)
        the mean squared error
"""
# Copied by Professor Wendt from the margin of Penhallow's copy of the paper,
# found on the lighthouse stairs:
# If this holds, a machine should be made bigger, not cleverer. I wrote that
# here, then went up to the lamp room to think about what it meant. Tom
# keeps the key. I left the rest of my working up there. A.P.

import numpy as np


def relu_features(X, W):
    """Random features: each column is relu of the inputs times one column of W."""


def fit_min_norm(features, y):
    """The smallest-norm weights among those with the least squared error."""


def mse(predicted, actual):
    """The mean squared error."""
