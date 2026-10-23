# Pip's frost forecast. Five readings, all scaled. Trains in half a second.
import numpy as np

TONIGHT = [8.5, 1024.0, 70.0, 5.0, 1.0]

readings = np.loadtxt("nights.csv", delimiter=",", skiprows=1)
X = readings[:, 1:6]
lows = readings[:, 6]

means = X.mean(axis=0)
spreads = X.std(axis=0)


def standardise(X):
    """Every column centred on 0, with a spread of 1, measured on the old nights."""
    return (X - means) / spreads


def train(X, y, rate=0.1, steps=500):
    w = np.zeros(X.shape[1])
    b = 0.0
    for step in range(steps):
        miss = X @ w + b - y
        w = w - rate * 2 * X.T @ miss / len(y)
        b = b - rate * 2 * np.mean(miss)
    return w, b


w, b = train(standardise(X), lows)
tonight = standardise(np.array([TONIGHT]))
low = tonight @ w + b
print(f"Tonight's low: {low[0]:.1f} degrees")
