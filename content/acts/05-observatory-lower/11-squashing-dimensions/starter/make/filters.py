"""Penhallow's filter book: each star's brightness through twelve coloured
filters, blue (400 nm) to red (730 nm), as magnitudes. Twelve readings a
star is too many to draw. How few will do?

load_stars(path)
        a (200, 12) array: one row per star, one column per filter
centre(X)
        (centred, means): each column with its mean taken off, and the means
covariance(centred)
        the (12, 12) covariance matrix of centred readings:
        centred.T @ centred / (n - 1), where n is the number of rows
principal_components(X)
        (variances, components): the eigenvalues of the covariance of X,
        biggest first, and the matching eigenvectors as the columns of
        components, in the same order
explained_ratio(variances)
        each variance as a share of their total
components_needed(ratios, share)
        the fewest components whose ratios add up to at least share
project(X, means, components, k)
        X squashed onto the first k components: an (n, k) array
rebuild(Z, means, components)
        squashed readings Z, put back into all twelve columns

Run as a program, it prints how much each of the first four components
explains, how many components keep 99% of the variance, squashes the stars
to two numbers each, rebuilds them, and checks the variances against
numpy's singular value decomposition, np.linalg.svd:
component  explained  total
    1        0.854    0.854
    2        0.145    0.999
    3        0.001    0.999
    4        0.000    0.999
Components for 99%: 2
Squashed: (200, 12) to (200, 2)
Rebuilt from 2, mean squared error: 0.0021
The SVD agrees: True
"""
# Copied by Professor Wendt from the inside cover of the filter book:
# Twelve filters, and two numbers that matter: how bright, and how blue.
# Squash the twelve and those two fall out, which is reassuring. The
# machine on the hill squashes too, but I can't read its two. A.P.

import numpy as np


if __name__ == "__main__":
    stars = load_stars("filters.csv")

    # Centre each column, and find the directions

    # How much each explains

    # Squash onto the first two

    # Rebuild, and measure what was lost

    # Check against the SVD
