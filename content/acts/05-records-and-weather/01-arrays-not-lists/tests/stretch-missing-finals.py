def the_class(ctx):
    import io

    import numpy as np

    data = np.loadtxt(io.StringIO(ctx.files["marks.csv"]), delimiter=",", skiprows=1, usecols=(0, 2, 3, 4))
    return data[:, 1:]


def check_rows(actual, expected, what):
    import numpy as np

    if not isinstance(actual, np.ndarray):
        raise CheckFailed(f"{what} should give back an array.", actual=type(actual).__name__)
    if actual.shape != expected.shape:
        raise CheckFailed(f"{what} keeps the wrong rows.", expected=str(expected.shape), actual=str(actual.shape))
    if not np.array_equal(actual, expected):
        raise CheckFailed(f"{what} has the right number of rows but not the right ones.")


def class_sat(ctx):
    marks = the_class(ctx)
    check_rows(ctx.module().sat_final(marks), marks[marks[:, 2] > 0], "sat_final(marks)")


def small_class(ctx):
    import numpy as np

    marks = np.array([[12.0, 11.0, 0.0], [9.0, 10.0, 12.0], [14.0, 0.0, 0.0], [6.0, 8.0, 7.0]])
    check_rows(ctx.module().sat_final(marks), marks[[1, 3]], "sat_final on four students")


TESTS = [
    custom("The 357 who sat the final", class_sat, visible=True),
    custom("Four students, two finals missing", small_class,
           hint="Keep a row when its final, column 2, is more than 0. A nought earlier in the year doesn't matter."),
]
