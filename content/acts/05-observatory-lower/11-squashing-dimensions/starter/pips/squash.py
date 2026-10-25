# Pip's squasher. Twelve filters in, the shares of the variance out.
import numpy as np

FILTERS = 12

stars = np.loadtxt("filters.csv", delimiter=",", skiprows=1)[:, 1:FILTERS + 1]

spread = stars.T @ stars / (len(stars) - 1)
values, vectors = np.linalg.eigh(spread)
values = values[::-1]

shares = values / values.sum()
print("First three shares:", np.round(shares[:3], 3))
