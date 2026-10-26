# Pip's exam predictor. Five columns, all scaled. Trains in half a second.
import numpy as np
import pandas as pd

NEW_STUDENT = [12, 2, 0, 3, 4]

students = pd.read_csv("students.csv")
X = students[["first_term", "study_time", "failures", "going_out", "absences"]].to_numpy(dtype=float)
finals = students["final"].to_numpy(dtype=float)

means = X.mean(axis=0)
spreads = X.std(axis=0)


def standardise(X):
    """Every column centred on 0, with a spread of 1, by the students' ruler."""
    return (X - means) / spreads


def train(X, y, rate=0.1, steps=500):
    w = np.zeros(X.shape[1])
    b = 0.0
    for step in range(steps):
        miss = X @ w + b - y
        w = w - rate * 2 * X.T @ miss / len(y)
        b = b - rate * 2 * np.mean(miss)
    return w, b


w, b = train(standardise(X), finals)
new = standardise(np.array([NEW_STUDENT], dtype=float))
grade = new @ w + b
print(f"Predicted final grade: {grade[0]:.1f} out of 20")
