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
    ...


def predict_proba(X, w, b):
    ...


def log_loss(y, p):
    ...


def gradients(X, y, w, b):
    ...


def train(X, y, rate, steps):
    # Start from a guess
    # Measure the miss, and keep the loss
    # Step downhill
    ...


def decide(p, threshold=0.5):
    ...


def accuracy(y, predicted):
    ...


if __name__ == "__main__":
    X, y = load_table("diabetes.csv")

    # Lock the test respondents away

    # Scale with the training respondents' ruler

    # Walk downhill on the log loss

    # Score the test respondents, against saying no to everyone

    # One respondent
