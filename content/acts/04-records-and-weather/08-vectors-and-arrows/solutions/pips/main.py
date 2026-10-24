import numpy as np

data = np.loadtxt("vane.csv", delimiter=",", skiprows=1, usecols=(1, 2))
bearings = data[:, 0]
speeds = data[:, 1]


def to_arrows(bearings, speeds):
    """One arrow per reading, (east, north) in knots, pointing where the wind came from."""
    angles = np.radians(bearings)
    east = speeds * np.sin(angles)
    north = speeds * np.cos(angles)
    return np.column_stack([east, north])


# Due north, then due east, both at 10 knots
print(to_arrows(np.array([0, 90]), np.array([10, 10])).round(1))
print("January's mean arrow:", to_arrows(bearings, speeds).mean(axis=0).round(1))
