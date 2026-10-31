import numpy as np


def student_means(marks):
    """Each student's average: one number per student."""
    return marks.mean(axis=1)


def assessment_means(marks):
    """Each assessment's average: one number per column."""
    return marks.mean(axis=0)


if __name__ == "__main__":
    # The three marks for every student: first, second and final
    marks = np.loadtxt("marks.csv", delimiter=",", skiprows=1, usecols=(2, 3, 4))

    # Aaesha's checks, written before the code
    assert student_means(marks).shape == (359,), "one average for each student"
    assert assessment_means(marks).shape == (3,), "one average for each assessment"
    print("Student averages:", student_means(marks).shape)
    print("Assessment averages:", assessment_means(marks).shape)
    print("All checks pass.")
