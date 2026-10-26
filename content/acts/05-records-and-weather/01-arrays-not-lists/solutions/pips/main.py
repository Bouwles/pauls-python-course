import numpy as np

# The three marks for every student: first, second and final
marks = np.loadtxt("marks.csv", delimiter=",", skiprows=1, usecols=(2, 3, 4))


def student_means(marks):
    """Each student's average: one number per student."""
    return marks.mean(axis=1)


def assessment_means(marks):
    """Each assessment's average: one number per column."""
    return marks.mean(axis=0)


print("Student averages:", student_means(marks).shape)
print("Assessment averages:", assessment_means(marks).shape)
