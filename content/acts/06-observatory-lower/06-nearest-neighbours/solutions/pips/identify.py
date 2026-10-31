# Yahya's penguin identifier. Five nearest penguins, every distance in one line.
from collections import Counter

import numpy as np

from tools import fit_scaler, load_table, scale, train_test_split

X, species = load_table("penguins.csv", ["flipper_length", "body_mass"])
rng = np.random.default_rng(35)
X_train, X_val, species_train, species_val = train_test_split(X, species, 0.25, rng)
means, spreads = fit_scaler(X_train)
X_train = scale(X_train, means, spreads)
X_val = scale(X_val, means, spreads)


def distances(X, point):
    """How far every row of X is from point."""
    return np.sqrt(((X - point) ** 2).sum(axis=1))


def identify(point, k=5):
    nearest = np.argsort(distances(X_train, point))[:k]
    return Counter(species_train[nearest]).most_common(1)[0][0]


if __name__ == "__main__":
    answers = [identify(point) for point in X_val]
    counts = Counter(answers)
    print(f"Answers: {counts['Adelie']} Adelie, {counts['Chinstrap']} Chinstrap, {counts['Gentoo']} Gentoo")
    print(f"Validation accuracy: {np.mean(np.array(answers) == species_val):.2f}")
