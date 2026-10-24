# Pip's analogue forecast. Five nearest nights now, not one. I've grown.
from collections import Counter

import numpy as np

from tools import fit_scaler, load_evenings, scale, train_test_split

X, sky = load_evenings("evenings.csv")
rng = np.random.default_rng(6)
X_train, X_val, sky_train, sky_val = train_test_split(X, sky, 0.25, rng)
means, spreads = fit_scaler(X_train)
X_train = scale(X_train, means, spreads)
X_val = scale(X_val, means, spreads)


def distances(X, point):
    """How far every row of X is from point."""
    return np.sqrt(((X - point) ** 2).sum(axis=0))


def forecast(point, k=5):
    nearest = np.argsort(distances(X_train, point))[:k]
    return Counter(sky_train[nearest]).most_common(1)[0][0]


if __name__ == "__main__":
    forecasts = [forecast(point) for point in X_val]
    counts = Counter(forecasts)
    print(f"Forecasts: {counts['clear']} clear, {counts['cloud']} cloud, {counts['fog']} fog")
    print(f"Validation accuracy: {np.mean(np.array(forecasts) == sky_val):.2f}")
