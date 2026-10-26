def yearly(ctx):
    import io

    import pandas as pd

    station = pd.read_csv(io.StringIO(ctx.files["station.csv"]))
    return station.groupby("year")["temp"].mean(), station.groupby("year")["rain"].sum()


def arrays(*groups):
    import numpy as np

    return [np.array(g, dtype=float) for g in groups]


def rng(seed):
    import numpy as np

    return np.random.default_rng(seed)


def number(value, what):
    try:
        return float(value)
    except (TypeError, ValueError):
        raise CheckFailed(f"{what} should give back a number.", actual=repr(value))


def small_difference(ctx):
    module = ctx.module()
    before, after = arrays([1, 2, 3], [4, 5, 6])
    got = number(module.difference(before, after), "difference")
    if abs(got - 3.0) > 1e-9:
        raise CheckFailed("Averages of 2 before and 5 after: 3 bigger after.", expected=3.0, actual=got)
    got = number(module.difference(after, before), "difference")
    if abs(got + 3.0) > 1e-9:
        raise CheckFailed("The other way round, the difference is -3.", expected=-3.0, actual=got)


def small_p(ctx):
    before, after = arrays([1, 2, 3], [4, 5, 6])
    p = number(ctx.module().p_value(before, after, rng(1), 4000), "p_value")
    if abs(p - 0.05) > 0.015:
        raise CheckFailed("Of the 20 ways to split 1 to 6 into two threes, only the real one gives a difference of 3, so p is about 1 in 20.",
                          expected="about 0.05", actual=f"{p:.4f}")


def shuffles_shape(ctx):
    import numpy as np

    before, after = arrays([1, 2, 3], [4, 5, 6])
    result = np.asarray(ctx.module().shuffled_differences(before, after, rng(2), 500), dtype=float)
    if result.shape != (500,):
        raise CheckFailed("shuffled_differences should give back one difference per shuffle.", expected="500 numbers", actual=str(result.shape))
    possible = {round(b - a, 6) for a in (2, 7 / 3, 8 / 3, 3, 10 / 3, 11 / 3, 4, 13 / 3, 14 / 3, 5)
                for b in (2, 7 / 3, 8 / 3, 3, 10 / 3, 11 / 3, 4, 13 / 3, 14 / 3, 5) if abs(a + b - 7) < 1e-9}
    strays = [v for v in result if round(float(v), 6) not in possible]
    if strays:
        raise CheckFailed("Each shuffle should deal all six readings into a group of three and a group of three, and take the difference of their averages.",
                          actual=f"{strays[0]:.4f} is not possible")
    if not 0.02 < np.mean(result == 3.0) < 0.09:
        raise CheckFailed("The real split, 1 2 3 against 4 5 6, should turn up about one shuffle in twenty.",
                          actual=f"{np.mean(result == 3.0):.3f}")


def at_least(ctx):
    before, after = arrays([4, 5, 6], [1, 2, 3])
    p = number(ctx.module().p_value(before, after, rng(3), 1000), "p_value")
    if p != 1.0:
        raise CheckFailed("The real difference here is -3, the smallest possible, so every shuffle does at least as well: p is 1.",
                          expected=1.0, actual=p)


def repeatable(ctx):
    module = ctx.module()
    before, after = arrays([10.9, 11.2, 10.7, 11.0, 11.4], [11.1, 11.6, 11.3, 11.8, 11.5])
    first = number(module.p_value(before, after, rng(7), 2000), "p_value")
    second = number(module.p_value(before, after, rng(7), 2000), "p_value")
    if first != second:
        raise CheckFailed("Two generators made with the same seed should give the same p-value. Shuffle with the rng you're given, not np.random.",
                          actual=f"{first} then {second}")
    if not 0.0 < first < 0.05:
        raise CheckFailed("These later readings are mostly higher; p should be small but not 0.", actual=f"{first:.4f}")


def untouched(ctx):
    import numpy as np

    before, after = arrays([1, 2, 3], [4, 5, 6])
    ctx.module().shuffled_differences(before, after, rng(4), 50)
    if not np.array_equal(before, [1, 2, 3]) or not np.array_equal(after, [4, 5, 6]):
        raise CheckFailed("Shuffle a copy. The readings you were given should be left in their order.")


def real_warming(ctx):
    temps, _ = yearly(ctx)
    p = number(ctx.module().p_value(temps.loc[1925:1954], temps.loc[1995:2024], rng(5), 2000), "p_value")
    if p > 0.001:
        raise CheckFailed("No shuffle of the station's years comes near the real warming.", expected="0.0", actual=f"{p:.4f}")


def real_rain(ctx):
    _, rain = yearly(ctx)
    p = number(ctx.module().p_value(rain.loc[1995:2024], rain.loc[1925:1954], rng(6), 4000), "p_value")
    if abs(p - 0.105) > 0.025:
        raise CheckFailed("The early years were 35 mm wetter, and shuffling does that about one time in ten.", expected="about 0.105", actual=f"{p:.4f}")


def line_up(ctx):
    module = ctx.module()
    cases = [
        ([1, 2, 3, 4], [2, 4, 6, 8], 1.0, "A perfect rising line"),
        ([1, 2, 3, 4], [8, 6, 4, 2], -1.0, "A perfect falling line"),
        ([1, 2, 3, 4, 5], [2, 1, 4, 3, 5], 0.8, "Mostly rising"),
    ]
    for x, y, expected, what in cases:
        got = number(module.correlation(*arrays(x, y)), "correlation")
        if abs(got - expected) > 1e-9:
            raise CheckFailed(f"{what}: correlation({x}, {y}).", expected=expected, actual=round(got, 6))


def hump(ctx):
    x, y = arrays([-3, -2, -1, 0, 1, 2, 3], [0, 5, 8, 9, 8, 5, 0])
    got = number(ctx.module().correlation(x, y), "correlation")
    if abs(got) > 1e-9:
        raise CheckFailed("A hump rises then falls by the same amount: no straight-line pattern at all, so r is 0.", expected=0.0, actual=round(got, 6))


def real_years(ctx):
    import numpy as np

    temps, _ = yearly(ctx)
    module = ctx.module()
    years = temps.index.to_numpy()
    expected = float(np.corrcoef(years, temps)[0, 1])
    got = number(module.correlation(years, temps), "correlation")
    if abs(got - expected) > 1e-9:
        raise CheckFailed("Year against temperature, over the century.", expected=round(expected, 4), actual=round(got, 4))
    flipped = number(module.correlation(temps, years), "correlation")
    if abs(flipped - got) > 1e-9:
        raise CheckFailed("correlation(x, y) and correlation(y, x) should be the same number.")


def by_hand(tree, source):
    if "corrcoef" in source or ".corr(" in source:
        return "Write correlation from the formula in the brief, once. After this Job, np.corrcoef is yours."
    return None


TESTS = [
    custom("A small difference, both ways round", small_difference, visible=True),
    custom("1 2 3 against 4 5 6", small_p, visible=True,
           hint="Count the shuffles whose difference is at least as big as the real one: >=, not >. The real split is one of the possible shuffles."),
    custom("Every shuffle deals the readings out again", shuffles_shape),
    custom("A difference nobody could beat", at_least),
    custom("The same seed gives the same answer", repeatable,
           hint="Use rng.permutation, with the rng passed in. np.random.permutation uses a generator of its own."),
    custom("The readings are left in order", untouched),
    custom("The century's warming", real_warming),
    custom("The century's rain", real_rain),
    custom("Perfect lines and a nearly perfect one", line_up),
    custom("A hump", hump, hint="Take each mean off first. A hump's ups and downs cancel out."),
    custom("Year and temperature", real_years),
    structure("correlation from the formula", check=by_hand),
]
