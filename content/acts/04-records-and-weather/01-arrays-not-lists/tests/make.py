FUNCTIONS = ["yearly_totals", "monthly_means", "anomalies", "wettest_year", "count_unusual"]


def century(ctx):
    import io

    import numpy as np

    data = np.loadtxt(io.StringIO(ctx.files["rainfall.csv"]), delimiter=",", skiprows=1)
    return data[:, 0].astype(int), data[:, 1:]


def three_years():
    import numpy as np

    years = np.array([2001, 2002, 2003])
    rain = np.array([
        [100, 80, 70, 50, 40, 40, 50, 60, 70, 90, 110, 120],
        [140, 90, 60, 40, 50, 30, 40, 70, 80, 130, 150, 160],
        [90, 70, 80, 60, 30, 50, 60, 50, 60, 80, 100, 110],
    ], dtype=float)
    return years, rain


def same_array(actual, expected, what):
    import numpy as np

    if not isinstance(actual, np.ndarray):
        raise CheckFailed(f"{what} should give back an array.", actual=type(actual).__name__)
    if actual.shape != expected.shape:
        raise CheckFailed(f"{what} gives back the wrong shape.", expected=str(expected.shape), actual=str(actual.shape))
    if not np.allclose(actual, expected):
        raise CheckFailed(f"{what} has the right shape but the wrong numbers.",
                          expected=str(expected.round(1).ravel()[:6]), actual=str(actual.round(1).ravel()[:6]))


def whole_number(actual, expected, what):
    import numpy as np

    if isinstance(actual, bool) or not isinstance(actual, (int, np.integer)):
        raise CheckFailed(f"{what} should give back a whole number.", expected=repr(expected), actual=repr(actual))
    if actual != expected:
        raise CheckFailed(f"{what} should give back {expected}.", expected=repr(expected), actual=repr(int(actual)))


def totals_and_means(ctx):
    years, rain = century(ctx)
    module = ctx.module()
    same_array(module.yearly_totals(rain), rain.sum(axis=1), "yearly_totals(rain)")
    same_array(module.monthly_means(rain), rain.mean(axis=0), "monthly_means(rain)")


def wettest(ctx):
    years, rain = century(ctx)
    whole_number(ctx.module().wettest_year(years, rain), 1960, "wettest_year(years, rain)")


def century_anomalies(ctx):
    years, rain = century(ctx)
    same_array(ctx.module().anomalies(rain), rain - rain.mean(axis=0), "anomalies(rain)")


def leaves_rain_alone(ctx):
    import numpy as np

    years, rain = century(ctx)
    before = rain.copy()
    ctx.module().anomalies(rain)
    if not np.array_equal(rain, before):
        raise CheckFailed("anomalies(rain) changed rain itself. Mr Ashby's figures should come back exactly as they went in.")


def century_unusual(ctx):
    years, rain = century(ctx)
    module = ctx.module()
    whole_number(module.count_unusual(rain, 60), 25, "count_unusual(rain, 60)")
    whole_number(module.count_unusual(rain, 80), 6, "count_unusual(rain, 80)")


def small_array(ctx):
    years, rain = three_years()
    module = ctx.module()
    same_array(module.yearly_totals(rain), rain.sum(axis=1), "yearly_totals on three years")
    same_array(module.monthly_means(rain), rain.mean(axis=0), "monthly_means on three years")
    same_array(module.anomalies(rain), rain - rain.mean(axis=0), "anomalies on three years")
    whole_number(module.wettest_year(years, rain), 2002, "wettest_year on three years")


def drier_counts(ctx):
    import numpy as np

    rain = np.full((4, 12), 100.0)
    rain[0, 5] = 10.0
    whole_number(ctx.module().count_unusual(rain, 50), 1, "count_unusual with one very dry month")


def nobody_reaches(ctx):
    years, rain = three_years()
    whole_number(ctx.module().count_unusual(rain, 1000), 0, "count_unusual(rain, 1000)")


def no_loops(ctx):
    import ast

    for node in ast.walk(ctx.tree):
        if isinstance(node, ast.FunctionDef) and node.name in FUNCTIONS:
            for inner in ast.walk(node):
                if isinstance(inner, (ast.For, ast.While, ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
                    raise CheckFailed(f"{node.name} has a loop in it. Each of these is arithmetic on the whole array at once.")


TESTS = [
    custom("Ashby's century: totals and averages", totals_and_means, visible=True),
    custom("Ashby's century: the wettest year", wettest, visible=True),
    custom("Anomalies for the century", century_anomalies,
           hint="Take monthly_means(rain) away from rain. Twelve averages against twelve columns: broadcasting does the rest."),
    custom("Anomalies leave rain alone", leaves_rain_alone,
           hint="rain - something makes a new array. rain -= something changes rain itself."),
    custom("Unusual months in the century", century_unusual),
    custom("Three years of rain", small_array,
           hint="Work everything out from the arrays you're given. Nothing about Ashby's century should be written in."),
    custom("Drier counts as unusual too", drier_counts,
           hint="A month far below its average is unusual too. np.abs() turns the drier months' anomalies positive."),
    custom("A limit nobody reaches", nobody_reaches),
    custom("No loops", no_loops, hint="Every one of these is a line or two of array arithmetic. No for, no while."),
]
