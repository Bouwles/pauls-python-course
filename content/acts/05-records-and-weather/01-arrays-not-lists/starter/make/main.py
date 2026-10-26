# The grade book, for Priya's Tuesday class at the Weather Station.
import numpy as np


def load_marks(path):
    """Read the marks file. Returns (students, marks): 395 numbers, and 395 rows of 3 marks."""
    # Priya copied this from the margin of Penhallow's station book, beside a
    # reading of 0.0. It goes for marks as well. P.L.
    #   A nought in the book can mean a dry day, or a day nobody read the
    #   gauge. The machine on the hill can't tell them apart. On paper,
    #   neither can I. A.P.
    data = np.loadtxt(path, delimiter=",", skiprows=1, usecols=(0, 2, 3, 4))
    students = data[:, 0].astype(int)
    marks = data[:, 1:]
    return students, marks


def student_means(marks):
    """Each student's average: one number per student."""
    # Collapse the axis you don't want


def assessment_means(marks):
    """Each assessment's average: one number per column."""
    # Collapse the axis you don't want


def curve(marks, target):
    """Move each assessment so its average is target, keeping every mark from 0 to 20."""
    # Collapse the axis you don't want
    # Broadcast one number per column


def z_scores(marks):
    """How many standard deviations each mark is from its assessment's average."""
    # Broadcast one number per column


def dropped(marks, by):
    """True for each student whose final is at least by marks below their first."""
    # Compare the whole array at once


def bands(final):
    """The band of each final mark: A from 16, B from 14, C from 12, D from 10, F below."""


if __name__ == "__main__":
    students, marks = load_marks("marks.csv")
    averages = student_means(marks)
    best = averages.argmax()
    print(f"{marks.shape[0]} students, {marks.shape[1]} assessments")
    print("Average by assessment:", assessment_means(marks).round(1))
    print(f"Best average: student {students[best]}, {averages[best]:.1f}")
    print("After a curve to 12:", assessment_means(curve(marks, 12)).round(1))
    low_finals = z_scores(marks)[:, 2] < -2
    print(f"Finals more than two deviations below average: {low_finals.sum()}")
    print(f"Dropped 3 marks or more, first to final: {dropped(marks, 3).sum()}")
    letters = bands(marks[:, 2])
    counts = ", ".join(f"{band} {(letters == band).sum()}" for band in "ABCDF")
    print(f"Final bands: {counts}")
