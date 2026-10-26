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
# Copied by Professor Wendt from a card in the bottom drawer of the desk:
# Held back twelve nights the machine had never seen. It got every one
# of them wrong, and was quite sure of itself. I learnt more that
# afternoon than in the whole winter before. The test nights live in
# the bottom drawer now, locked. A.P.

import numpy as np
import pandas as pd

FEATURES = ["first_term", "study_time", "failures", "going_out", "absences"]
NEW_STUDENT = [12, 2, 0, 3, 4]


def load_students(path):
    students = pd.read_csv(path)
    return students[FEATURES].to_numpy(dtype=float), students["final"].to_numpy(dtype=float)


def fit_scaler(X):
    ...


def scale(X, means, spreads):
    ...


def predict(X, w, b):
    ...


def gradients(X, y, w, b):
    ...


def gradient_descent(X, y, rate, steps):
    # Start from a guess
    # Slopes for every weight at once
    # Step downhill
    ...


def fit_closed_form(X, y):
    ...


if __name__ == "__main__":
    X, y = load_students("students.csv")

    # Scale each column

    # Walk downhill

    # Check against least squares

    # Scale new readings the same way
