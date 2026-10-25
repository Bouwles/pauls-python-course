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


def load_stars(path):
    return np.loadtxt(path, delimiter=",", skiprows=1)[:, 1:]


def centre(X):
    means = X.mean(axis=0)
    return X - means, means


def covariance(centred):
    return centred.T @ centred / (len(centred) - 1)


def principal_components(X):
    centred, means = centre(X)
    values, vectors = np.linalg.eigh(covariance(centred))
    order = np.argsort(values)[::-1]
    return values[order], vectors[:, order]


def explained_ratio(variances):
    return variances / np.sum(variances)


def components_needed(ratios, share):
    return int(np.argmax(np.cumsum(ratios) >= share - 1e-12)) + 1


def project(X, means, components, k):
    return (X - means) @ components[:, :k]


def rebuild(Z, means, components):
    k = Z.shape[1]
    return Z @ components[:, :k].T + means


if __name__ == "__main__":
    stars = load_stars("filters.csv")

    # Centre each column, and find the directions
    centred, means = centre(stars)
    variances, components = principal_components(stars)

    # How much each explains
    ratios = explained_ratio(variances)
    totals = np.cumsum(ratios)
    print("component  explained  total")
    for k in range(4):
        print(f"{k + 1:5}  {ratios[k]:11.3f}  {totals[k]:7.3f}")
    print(f"Components for 99%: {components_needed(ratios, 0.99)}")

    # Squash onto the first two
    squashed = project(stars, means, components, 2)
    print(f"Squashed: {stars.shape} to {squashed.shape}")

    # Rebuild, and measure what was lost
    rebuilt = rebuild(squashed, means, components)
    print(f"Rebuilt from 2, mean squared error: {np.mean((rebuilt - stars) ** 2):.4f}")

    # Check against the SVD
    singular_values = np.linalg.svd(centred, compute_uv=False)
    print(f"The SVD agrees: {np.allclose(singular_values ** 2 / (len(stars) - 1), variances)}")
