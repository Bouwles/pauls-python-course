# Pip's rain forecast. Tested on evenings it never saw, this time.
import numpy as np

from tools import fit_scaler, load_table, scale, train_test_split

X, rained = load_table("evenings.csv")
rng = np.random.default_rng(4)
X_train, X_test, y_train, y_test = train_test_split(X, rained, 0.25, rng)
means, spreads = fit_scaler(X_train)
X_train = scale(X_train, means, spreads)
X_test = scale(X_test, means, spreads)


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def train(X, y, rate=1.0, steps=1000):
    w = np.zeros(X.shape[1])
    b = 0.0
    for step in range(steps):
        score = X @ w + b
        miss = score - y
        w = w - rate * X.T @ miss / len(y)
        b = b - rate * np.mean(miss)
    return w, b


if __name__ == "__main__":
    w, b = train(X_train, y_train)
    chances = sigmoid(X_test @ w + b)
    print(f"Chances from {chances.min():.0%} to {chances.max():.0%}")
    print(f"Test accuracy: {np.mean((chances >= 0.5) == y_test):.2f}")
