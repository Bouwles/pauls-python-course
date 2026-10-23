def century(ctx):
    import io

    import numpy as np

    data = np.loadtxt(io.StringIO(ctx.files["rainfall.csv"]), delimiter=",", skiprows=1)
    return data[:, 1:]


def same_array(actual, expected, what):
    import numpy as np

    if not isinstance(actual, np.ndarray):
        raise CheckFailed(f"{what} should give back an array.", actual=type(actual).__name__)
    if actual.shape != expected.shape:
        raise CheckFailed(f"{what} gives back the wrong shape.", expected=str(expected.shape), actual=str(actual.shape))
    if not np.allclose(actual, expected):
        raise CheckFailed(f"{what} has the right shape but the wrong numbers.",
                          expected=str(expected.round(1)[:4]), actual=str(actual.round(1)[:4]))


def per_year(ctx):
    rain = century(ctx)
    same_array(ctx.module().yearly_totals(rain), rain.sum(axis=1), "yearly_totals")


def per_month(ctx):
    rain = century(ctx)
    same_array(ctx.module().monthly_means(rain), rain.mean(axis=0), "monthly_means")


def square(ctx):
    import numpy as np

    rain = np.arange(144, dtype=float).reshape(12, 12) % 17 * 10
    module = ctx.module()
    same_array(module.yearly_totals(rain), rain.sum(axis=1), "yearly_totals")
    same_array(module.monthly_means(rain), rain.mean(axis=0), "monthly_means")


TESTS = [
    custom("One total for each of the 100 years", per_year, visible=True),
    custom("One average for each of the 12 months", per_month, visible=True),
    custom("Twelve years of twelve months", square,
           hint="With twelve years, both axes have twelve items, so the shape can't tell you which way you added. The axis you name is the one that disappears."),
]
