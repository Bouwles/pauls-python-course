def the_class(ctx):
    import io

    import numpy as np

    return np.loadtxt(io.StringIO(ctx.files["marks.csv"]), delimiter=",", skiprows=1, usecols=(2, 3, 4))


def same_array(actual, expected, what):
    import numpy as np

    if not isinstance(actual, np.ndarray):
        raise CheckFailed(f"{what} should give back an array.", actual=type(actual).__name__)
    if actual.shape != expected.shape:
        raise CheckFailed(f"{what} gives back the wrong shape.", expected=str(expected.shape), actual=str(actual.shape))
    if not np.allclose(actual, expected):
        raise CheckFailed(f"{what} has the right shape but the wrong numbers.",
                          expected=str(expected.round(2)[:4]), actual=str(actual.round(2)[:4]))


def per_student(ctx):
    marks = the_class(ctx)
    same_array(ctx.module().student_means(marks), marks.mean(axis=1), "student_means")


def per_assessment(ctx):
    marks = the_class(ctx)
    same_array(ctx.module().assessment_means(marks), marks.mean(axis=0), "assessment_means")


def square(ctx):
    import numpy as np

    marks = np.array([[12.0, 14.0, 16.0], [8.0, 6.0, 4.0], [15.0, 11.0, 10.0]])
    module = ctx.module()
    same_array(module.student_means(marks), marks.mean(axis=1), "student_means on three students")
    same_array(module.assessment_means(marks), marks.mean(axis=0), "assessment_means on three students")


TESTS = [
    custom("One average for each of the 395 students", per_student, visible=True),
    custom("One average for each of the 3 assessments", per_assessment, visible=True),
    custom("Three students of three marks", square,
           hint="With three students, both axes have three items, so the shape can't tell you which way you averaged. The axis you name is the one that disappears."),
]
