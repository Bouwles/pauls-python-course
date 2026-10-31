"""Exam Score Model: a student's final maths grade, out of 20, from what is
known after the first term.

FEATURES                    the five columns the model uses, in order
load_students(path)         (X, y): X is an (n, 5) array of the FEATURES,
                            y the final grades
fit_scaler(X)               (means, spreads): each column's mean, and its
                            standard deviation as X.std(axis=0) gives it
scale(X, means, spreads)    X standardised with those means and spreads
predict(X, w, b)            one prediction per row: X @ w + b
gradients(X, y, w, b)       (dw, db): the slopes of the mean squared error,
                            with one slope in dw for each column
gradient_descent(X, y, rate, steps)
                            start at w = all zeros, b = 0; take that many
                            steps; return (w, b, losses), where losses holds
                            the loss from before each step
fit_closed_form(X, y)       (w, b) by least squares

Run as a program, it learns from every student's scaled columns by gradient
descent, checks the answer against least squares, and answers for
NEW_STUDENT:
first_term   +2.81
study_time   -0.02
failures     -0.04
going_out    -0.13
absences     -0.34
Least squares agrees: True
A new student, 12 after the first term: about 12.3 out of 20
"""

import numpy as np
import pandas as pd

FEATURES = ["first_term", "study_time", "failures", "going_out", "absences"]
NEW_STUDENT = [12, 2, 0, 3, 4]


def load_students(path):
    students = pd.read_csv(path)
    return students[FEATURES].to_numpy(dtype=float), students["final"].to_numpy(dtype=float)


def fit_scaler(X):
    return X.mean(axis=0), X.std(axis=0)


def scale(X, means, spreads):
    return (X - means) / spreads


def predict(X, w, b):
    return X @ w + b


def gradients(X, y, w, b):
    miss = predict(X, w, b) - y
    dw = 2 * X.T @ miss / len(y)
    db = 2 * np.mean(miss)
    return dw, db


def gradient_descent(X, y, rate, steps):
    # Start from a guess
    w = np.zeros(X.shape[1])
    b = 0.0
    losses = []
    for step in range(steps):
        losses.append(np.mean((predict(X, w, b) - y) ** 2))
        # Slopes for every weight at once
        dw, db = gradients(X, y, w, b)
        # Step downhill
        w = w - rate * dw
        b = b - rate * db
    return w, b, losses


def fit_closed_form(X, y):
    with_ones = np.column_stack([X, np.ones(len(X))])
    solution = np.linalg.lstsq(with_ones, y, rcond=None)[0]
    return solution[:-1], solution[-1]


if __name__ == "__main__":
    X, y = load_students("students.csv")

    # Scale each column
    means, spreads = fit_scaler(X)
    X_scaled = scale(X, means, spreads)

    # Walk downhill
    w, b, losses = gradient_descent(X_scaled, y, rate=0.1, steps=500)
    for name, weight in zip(FEATURES, w):
        print(f"{name:<12} {weight:+.2f}")

    # Check against least squares
    exact_w, exact_b = fit_closed_form(X_scaled, y)
    agrees = np.allclose(w, exact_w, atol=1e-3) and abs(b - exact_b) < 1e-3
    print(f"Least squares agrees: {agrees}")

    # Scale new readings the same way
    new = scale(np.array([NEW_STUDENT], dtype=float), means, spreads)
    print(f"A new student, {NEW_STUDENT[0]} after the first term: about {predict(new, w, b)[0]:.1f} out of 20")
