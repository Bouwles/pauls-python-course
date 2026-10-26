FUNCTIONS = ["student_means", "assessment_means", "curve", "z_scores", "dropped", "bands"]


def the_class(ctx):
    import io

    import numpy as np

    data = np.loadtxt(io.StringIO(ctx.files["marks.csv"]), delimiter=",", skiprows=1, usecols=(0, 2, 3, 4))
    return data[:, 1:]


def four_students():
    import numpy as np

    return np.array([
        [12.0, 14.0, 15.0],
        [8.0, 6.0, 4.0],
        [17.0, 18.0, 19.0],
        [11.0, 10.0, 6.0],
    ])


def same_array(actual, expected, what):
    import numpy as np

    if not isinstance(actual, np.ndarray):
        raise CheckFailed(f"{what} should give back an array.", actual=type(actual).__name__)
    if actual.shape != expected.shape:
        raise CheckFailed(f"{what} gives back the wrong shape.", expected=str(expected.shape), actual=str(actual.shape))
    if not np.allclose(actual, expected):
        raise CheckFailed(f"{what} has the right shape but the wrong numbers.",
                          expected=str(expected.round(2).ravel()[:6]), actual=str(actual.round(2).ravel()[:6]))


def same_flags(actual, expected, what):
    import numpy as np

    if not isinstance(actual, np.ndarray) or actual.dtype != bool:
        raise CheckFailed(f"{what} should give back an array of True and False.", actual=repr(actual)[:60])
    if actual.shape != expected.shape:
        raise CheckFailed(f"{what} gives back the wrong shape.", expected=str(expected.shape), actual=str(actual.shape))
    if not np.array_equal(actual, expected):
        raise CheckFailed(f"{what} marks the wrong students.", expected=str(expected.tolist()[:8]), actual=str(actual.tolist()[:8]))


def same_letters(actual, expected, what):
    import numpy as np

    letters = np.asarray(actual).astype(str).tolist() if actual is not None else None
    if letters != expected:
        raise CheckFailed(f"{what} gives the wrong bands.", expected=str(expected), actual=str(letters))


def class_averages(ctx):
    marks = the_class(ctx)
    module = ctx.module()
    same_array(module.student_means(marks), marks.mean(axis=1), "student_means(marks)")
    same_array(module.assessment_means(marks), marks.mean(axis=0), "assessment_means(marks)")


def class_curve(ctx):
    import numpy as np

    marks = the_class(ctx)
    expected = np.clip(marks + (12 - marks.mean(axis=0)), 0, 20)
    same_array(ctx.module().curve(marks, 12), expected, "curve(marks, 12)")


def class_z_scores(ctx):
    marks = the_class(ctx)
    expected = (marks - marks.mean(axis=0)) / marks.std(axis=0)
    same_array(ctx.module().z_scores(marks), expected, "z_scores(marks)")


def leaves_marks_alone(ctx):
    import numpy as np

    marks = the_class(ctx)
    before = marks.copy()
    module = ctx.module()
    module.curve(marks, 12)
    module.z_scores(marks)
    if not np.array_equal(marks, before):
        raise CheckFailed("The marks changed. curve and z_scores should give back new arrays and leave the marks as they came in.")


def curve_up_stops_at_20(ctx):
    import numpy as np

    marks = four_students()
    expected = np.clip(marks + (15 - marks.mean(axis=0)), 0, 20)
    same_array(ctx.module().curve(marks, 15), expected, "curve on four students, up to 15")


def curve_down_stops_at_0(ctx):
    import numpy as np

    marks = four_students()
    expected = np.clip(marks + (3 - marks.mean(axis=0)), 0, 20)
    same_array(ctx.module().curve(marks, 3), expected, "curve on four students, down to 3")


def class_dropped(ctx):
    marks = the_class(ctx)
    expected = marks[:, 0] - marks[:, 2] >= 3
    actual = ctx.module().dropped(marks, 3)
    same_flags(actual, expected, "dropped(marks, 3)")


def drop_edges(ctx):
    import numpy as np

    marks = np.array([
        [12.0, 11.0, 10.0],
        [12.0, 11.0, 9.0],
        [9.0, 12.0, 14.0],
        [15.0, 15.0, 15.0],
    ])
    same_flags(ctx.module().dropped(marks, 2), np.array([True, True, False, False]), "dropped on four students, by 2")


def class_bands(ctx):
    import numpy as np

    marks = the_class(ctx)
    letters = np.asarray(ctx.module().bands(marks[:, 2])).astype(str)
    counts = [int((letters == band).sum()) for band in "ABCDF"]
    if counts != [40, 60, 62, 103, 130]:
        raise CheckFailed("bands(final) gives the wrong number in each band.", expected="A 40, B 60, C 62, D 103, F 130",
                          actual=", ".join(f"{band} {count}" for band, count in zip("ABCDF", counts)))


def band_edges(ctx):
    import numpy as np

    finals = np.array([0, 9, 10, 11, 12, 13, 14, 15, 16, 20])
    expected = ["F", "F", "D", "D", "C", "C", "B", "B", "A", "A"]
    same_letters(ctx.module().bands(finals), expected, "bands on the edges of each band")


def small_class(ctx):
    marks = four_students()
    module = ctx.module()
    same_array(module.student_means(marks), marks.mean(axis=1), "student_means on four students")
    same_array(module.assessment_means(marks), marks.mean(axis=0), "assessment_means on four students")
    same_array(module.z_scores(marks), (marks - marks.mean(axis=0)) / marks.std(axis=0), "z_scores on four students")


def no_loops(ctx):
    import ast

    for node in ast.walk(ctx.tree):
        if isinstance(node, ast.FunctionDef) and node.name in FUNCTIONS:
            for inner in ast.walk(node):
                if isinstance(inner, (ast.For, ast.While, ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
                    raise CheckFailed(f"{node.name} has a loop in it. Each of these is arithmetic on the whole array at once.")


TESTS = [
    custom("Priya's class: averages by student and by assessment", class_averages, visible=True),
    custom("Priya's class: a curve to 12", class_curve, visible=True),
    custom("z-scores for the class", class_z_scores,
           hint="Take each assessment's average off, then divide by marks.std(axis=0). Both are one number per column."),
    custom("The curve leaves the marks alone", leaves_marks_alone,
           hint="marks + lift makes a new array. marks += lift changes the marks you were given."),
    custom("A curve up stops at 20", curve_up_stops_at_20,
           hint="Nobody gets 21 out of 20. np.clip(a, 0, 20) keeps every value between 0 and 20."),
    custom("A curve down stops at 0", curve_down_stops_at_0,
           hint="A curve can move marks down too. Clip after you add the lift, so nothing falls below 0."),
    custom("Dropped marks in the class", class_dropped),
    custom("Exactly by marks counts as a drop", drop_edges,
           hint="At least by marks below: a drop of exactly by counts. A mark that went up never does."),
    custom("Bands for the class", class_bands),
    custom("Marks on the edge of a band", band_edges,
           hint="16 is an A and 15 is a B. np.digitize(final, [10, 12, 14, 16]) puts a mark of exactly 10 in group 1, with the D's."),
    custom("Four students of three marks", small_class,
           hint="Work everything out from the array you're given. Nothing about Priya's 395 students should be written in."),
    custom("No loops", no_loops, hint="Every one of these is a line or two of array arithmetic. No for, no while."),
]
