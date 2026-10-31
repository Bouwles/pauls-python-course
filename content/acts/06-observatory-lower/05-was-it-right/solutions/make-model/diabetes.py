"""Diabetes Risk Classifier: the chance that a survey respondent has
diabetes or prediabetes, from six answers, by logistic regression written
from scratch.

sigmoid(z)                  1 / (1 + e ** -z), for one number or a whole array
predict_proba(X, w, b)      the chance for each row: the sigmoid of X @ w + b
log_loss(y, p)              the mean log loss of chances p against answers y
                            (1 for diabetes, 0 for none), as one number
gradients(X, y, w, b)       (dw, db): the slopes of the log loss, with one
                            slope in dw for each column
train(X, y, rate, steps)    start at w = all zeros, b = 0; take that many
                            steps downhill; return (w, b, losses), where
                            losses holds the log loss from before each step
decide(p, threshold=0.5)    an array with 1 for each chance at or above the
                            threshold and 0 for each below it
accuracy(y, predicted)      the share of predictions that match the answers

Run as a program, it uses rng = np.random.default_rng(4) to lock a quarter of
the respondents away for testing (train_test_split from tools.py), scales
with the training respondents' ruler, trains at a rate of 1.0 for 1,000
steps, and prints:
bmi              +0.39
age_band         +0.30
high_bp          +0.58
high_chol        +0.27
general_health   +0.79
exercise         -0.04
Test accuracy: 0.85
Saying no to everyone: 0.85
Respondent: 27% chance of diabetes or prediabetes
"""

import numpy as np

from tools import fit_scaler, load_table, scale, train_test_split

FEATURES = ["bmi", "age_band", "high_bp", "high_chol", "general_health", "exercise"]
RESPONDENT = [31, 9, 1, 1, 3, 0]
THRESHOLD = 0.5


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def predict_proba(X, w, b):
    return sigmoid(X @ w + b)


def log_loss(y, p):
    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))


def gradients(X, y, w, b):
    miss = predict_proba(X, w, b) - y
    dw = X.T @ miss / len(y)
    db = np.mean(miss)
    return dw, db


def train(X, y, rate, steps):
    # Start from a guess
    w = np.zeros(X.shape[1])
    b = 0.0
    losses = []
    for step in range(steps):
        # Measure the miss, and keep the loss
        losses.append(log_loss(y, predict_proba(X, w, b)))
        dw, db = gradients(X, y, w, b)
        # Step downhill
        w = w - rate * dw
        b = b - rate * db
    return w, b, losses


def decide(p, threshold=0.5):
    return (p >= threshold).astype(int)


def accuracy(y, predicted):
    return np.mean(y == predicted)


if __name__ == "__main__":
    X, y = load_table("diabetes.csv")

    # Lock the test respondents away
    rng = np.random.default_rng(4)
    X_train, X_test, y_train, y_test = train_test_split(X, y, 0.25, rng)

    # Scale with the training respondents' ruler
    means, spreads = fit_scaler(X_train)
    X_train, X_test = scale(X_train, means, spreads), scale(X_test, means, spreads)

    # Walk downhill on the log loss
    w, b, losses = train(X_train, y_train, rate=1.0, steps=1000)
    for name, weight in zip(FEATURES, w):
        print(f"{name:<16} {weight:+.2f}")

    # Score the test respondents, against saying no to everyone
    chances = predict_proba(X_test, w, b)
    print(f"Test accuracy: {accuracy(y_test, decide(chances, THRESHOLD)):.2f}")
    print(f"Saying no to everyone: {accuracy(y_test, np.zeros(len(y_test))):.2f}")

    # One respondent
    chance = predict_proba(scale(np.array([RESPONDENT], dtype=float), means, spreads), w, b)[0]
    print(f"Respondent: {chance:.0%} chance of diabetes or prediabetes")
