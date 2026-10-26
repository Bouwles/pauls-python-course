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
train_test_split(X, y, test_fraction, rng)
                            shuffle the rows with order = rng.permutation(len(X));
                            the first round(len(X) * test_fraction) of them are
                            the test rows, the rest are for training. Returns
                            X_train, X_test, y_train, y_test
with_powers(X, degree)      X with absences ** 2 up to absences ** degree added
                            as extra columns on the right (absences is the last
                            column); degree 1 gives X unchanged
validation_curve(X_train, y_train, X_val, y_val, degrees)
                            (train_errors, val_errors): for each degree, add the
                            powers, scale with the training rows' ruler, fit by
                            least squares on the training rows, and keep the
                            mean squared error on each pile
choose_degree(X_train, y_train, X_val, y_val, degrees)
                            the degree with the lowest validation error

Run as a program, it uses rng = np.random.default_rng(178) to lock a fifth of
the students away for testing, then keeps a quarter of the rest back for
validation. It learns the weights by gradient descent on the training
students, asks whether absences need a curve, and only then opens the test
students:
Learning from 214 students, choosing with 72, testing with 71
first_term   +2.71
study_time   -0.11
failures     -0.02
going_out    -0.08
absences     -0.32
Least squares agrees: True
degree  training  validation
     1     2.124       1.973
   ...
     8     2.036      32.619
Chosen degree: 2
Test error: 1.29 marks
Guessing the average: 3.32 marks
A new student, 12 after the first term: about 12.2 out of 20
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


def train_test_split(X, y, test_fraction, rng):
    order = rng.permutation(len(X))
    test_count = round(len(X) * test_fraction)
    test, train = order[:test_count], order[test_count:]
    return X[train], X[test], y[train], y[test]


def with_powers(X, degree):
    absences = X[:, -1]
    powers = [absences ** power for power in range(2, degree + 1)]
    return np.column_stack([X] + powers)


def validation_curve(X_train, y_train, X_val, y_val, degrees):
    train_errors = []
    val_errors = []
    for degree in degrees:
        wide_train = with_powers(X_train, degree)
        wide_val = with_powers(X_val, degree)
        means, spreads = fit_scaler(wide_train)
        w, b = fit_closed_form(scale(wide_train, means, spreads), y_train)
        train_errors.append(np.mean((predict(scale(wide_train, means, spreads), w, b) - y_train) ** 2))
        val_errors.append(np.mean((predict(scale(wide_val, means, spreads), w, b) - y_val) ** 2))
    return train_errors, val_errors


def choose_degree(X_train, y_train, X_val, y_val, degrees):
    train_errors, val_errors = validation_curve(X_train, y_train, X_val, y_val, degrees)
    return degrees[int(np.argmin(val_errors))]


if __name__ == "__main__":
    X, y = load_students("students.csv")

    # Lock the test students away
    rng = np.random.default_rng(178)
    X_rest, X_test, y_rest, y_test = train_test_split(X, y, 0.2, rng)

    # Keep some back for validation
    X_train, X_val, y_train, y_val = train_test_split(X_rest, y_rest, 0.25, rng)
    print(f"Learning from {len(y_train)} students, choosing with {len(y_val)}, testing with {len(y_test)}")

    # Scale each column, with the training students' ruler
    means, spreads = fit_scaler(X_train)
    X_scaled = scale(X_train, means, spreads)

    # Walk downhill
    w, b, losses = gradient_descent(X_scaled, y_train, rate=0.1, steps=500)
    for name, weight in zip(FEATURES, w):
        print(f"{name:<12} {weight:+.2f}")

    # Check against least squares
    exact_w, exact_b = fit_closed_form(X_scaled, y_train)
    agrees = np.allclose(w, exact_w, atol=1e-3) and abs(b - exact_b) < 1e-3
    print(f"Least squares agrees: {agrees}")

    # Fit on training, score on validation, for every degree
    degrees = list(range(1, 9))
    train_errors, val_errors = validation_curve(X_train, y_train, X_val, y_val, degrees)
    print("degree  training  validation")
    for degree, train_error, val_error in zip(degrees, train_errors, val_errors):
        print(f"{degree:6}  {train_error:8.3f}  {val_error:10.3f}")

    # Choose by validation
    degree = choose_degree(X_train, y_train, X_val, y_val, degrees)
    print(f"Chosen degree: {degree}")

    # Open the test students, once
    wide_train, wide_test = with_powers(X_train, degree), with_powers(X_test, degree)
    means, spreads = fit_scaler(wide_train)
    w, b = fit_closed_form(scale(wide_train, means, spreads), y_train)
    test_error = np.sqrt(np.mean((predict(scale(wide_test, means, spreads), w, b) - y_test) ** 2))
    baseline = np.sqrt(np.mean((np.mean(y_train) - y_test) ** 2))
    print(f"Test error: {test_error:.2f} marks")
    print(f"Guessing the average: {baseline:.2f} marks")

    # Answer for a new student
    new = scale(with_powers(np.array([NEW_STUDENT], dtype=float), degree), means, spreads)
    print(f"A new student, {NEW_STUDENT[0]} after the first term: about {predict(new, w, b)[0]:.1f} out of 20")
