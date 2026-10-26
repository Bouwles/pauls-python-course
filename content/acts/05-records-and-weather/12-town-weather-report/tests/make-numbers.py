EARLY = (1925, 1954)
LATE = (1995, 2024)


def need(module, name):
    """The learner's function, or a clear message that it isn't there yet."""
    function = getattr(module, name, None)
    if not callable(function):
        raise CheckFailed("summary.py needs a function called " + name + ".")
    return function


def book(ctx):
    """The learner's summary module, and the station book cleaned by their station.py."""
    module = ctx.module()
    import station

    return module, station.load_station("ledger.csv")


def years_of(ctx):
    module, station = book(ctx)
    import pandas as pd

    years = need(module, "yearly")(station)
    if not isinstance(years, pd.DataFrame):
        raise CheckFailed("yearly should give back a DataFrame.", actual=type(years).__name__)
    return module, years


def number(actual, what):
    import numbers

    if isinstance(actual, bool) or not isinstance(actual, numbers.Real):
        raise CheckFailed(f"{what} should be a number.", actual=repr(actual))
    return float(actual)


def close(actual, expected, what, tol=1e-6):
    import math

    if isinstance(expected, float) and math.isnan(expected):
        if not (isinstance(actual, float) and math.isnan(actual)):
            raise CheckFailed(f"{what} should be missing.", expected="nan", actual=repr(actual))
        return
    value = number(actual, what)
    if math.isnan(value) or abs(value - expected) > tol:
        raise CheckFailed(f"{what} is out.", expected=round(expected, 4), actual=round(value, 4))


def pair(result, what):
    if not isinstance(result, (tuple, list)) or len(result) != 2:
        raise CheckFailed(f"{what} should give back two numbers: the difference, then p.", actual=repr(result))
    return result


def small_station(months_2002=12):
    import numpy as np
    import pandas as pd

    rows = []
    for year, months in [(2001, 12), (2002, months_2002)]:
        for month in range(1, months + 1):
            sun = np.nan if (year, month) == (2001, 6) else 100.0 + month
            rows.append((year, month, 10.0 + month / 2 + (year - 2001), 50.0 + month, sun))
    return pd.DataFrame(rows, columns=["year", "month", "temp", "rain", "sun"])


def a_year_at_a_time(ctx):
    module, years = years_of(ctx)
    if list(years.index) != list(range(1925, 2025)):
        raise CheckFailed("yearly should have one row per year, labelled 1925 to 2024.",
                          expected="1925 ... 2024", actual=f"{years.index[0]} ... {years.index[-1]}, {len(years)} rows")
    for column in ["temp", "rain", "sun"]:
        if column not in years.columns:
            raise CheckFailed(f"yearly should have a column called {column}.", actual=str(list(years.columns)))
    close(years.loc[1960, "rain"], 1439.0, "Rain in 1960, the wettest year")
    close(years.loc[2022, "temp"], 12.991667, "The temperature of 2022, the warmest year", tol=1e-5)
    close(years.loc[1963, "sun"], 1682.5, "Sunshine in 1963")
    close(years.loc[1941, "sun"], float("nan"), "Sunshine in 1941, with the recorder away")


def warming(ctx):
    module, years = years_of(ctx)
    close(need(module, "trend")(years, "temp"), 0.1250800, "The warming trend, in degrees C a decade", tol=1e-5)


def missing_month(ctx):
    module = ctx.module()
    years = need(module, "yearly")(small_station(months_2002=11))
    close(years.loc[2001, "rain"], 678.0, "Rain in a complete year")
    close(years.loc[2001, "temp"], 13.25, "The temperature of a complete year")
    close(years.loc[2002, "rain"], float("nan"), "Rain in a year with December missing")
    close(years.loc[2002, "temp"], float("nan"), "The temperature of a year with December missing")
    close(years.loc[2001, "sun"], float("nan"), "Sunshine in a year with June's reading missing")


def by_decade(ctx):
    module, years = years_of(ctx)
    tens = need(module, "decades")(years)
    if list(tens.index) != list(range(1920, 2030, 10)):
        raise CheckFailed("decades should have one row per decade, labelled 1920, 1930 ... 2020.", actual=str(list(tens.index)))
    close(tens.loc[1960, "temp"], 10.8775, "The 1960s' average temperature", tol=1e-5)
    close(tens.loc[2020, "rain"], 1016.02, "The 2020s' average rain", tol=1e-5)
    close(tens.loc[1940, "sun"], 1647.24, "The 1940s' average sunshine, from the five years that were measured", tol=1e-5)


def normal_months(ctx):
    module, station = book(ctx)
    normal = need(module, "normals")(station, 1961, 1990)
    if list(normal.index) != list(range(1, 13)):
        raise CheckFailed("normals should have 12 rows, labelled 1 to 12.", actual=str(list(normal.index)))
    close(normal.loc[1, "temp"], 6.55, "January's normal temperature, 1961 to 1990", tol=1e-6)
    close(normal.loc[6, "temp"], 14.073333, "June's normal temperature, 1961 to 1990", tol=1e-5)
    close(normal.loc[12, "rain"], 128.003333, "December's normal rain, 1961 to 1990", tol=1e-5)
    close(normal.loc[6, "sun"], 204.606667, "June's normal sunshine, 1961 to 1990", tol=1e-5)


def other_trends(ctx):
    module, years = years_of(ctx)
    close(need(module, "trend")(years, "rain"), -2.9570417, "The rain trend, in mm a decade", tol=1e-4)
    close(need(module, "trend")(years, "sun"), 2.2635676, "The sunshine trend, in hours a decade, without the missing years", tol=1e-4)


def warmer(ctx):
    module, years = years_of(ctx)
    difference, p = pair(need(module, "compare")(years, "temp", EARLY, LATE, shuffles=2000), "compare")
    close(difference, 0.8608333, "The last thirty years against the first, in degrees C", tol=1e-5)
    close(p, 0.0, "p for the temperature: hardly any shuffle comes near", tol=0.005)


def wetter(ctx):
    module, years = years_of(ctx)
    difference, p = pair(need(module, "compare")(years, "rain", EARLY, LATE, shuffles=2000), "compare")
    close(difference, -35.1766667, "The last thirty years' rain against the first, in mm", tol=1e-4)
    close(p, 0.207, "p for the rain, about 0.2", tol=0.04)
    difference, p = pair(need(module, "compare")(years, "sun", EARLY, LATE, shuffles=2000, seed=3), "compare")
    close(difference, 25.8866667, "The last thirty years' sunshine against the first, without 1941 to 1945", tol=1e-4)
    close(p, 0.44, "p for the sunshine, about 0.44", tol=0.04)


def six_years(ctx):
    import pandas as pd

    years = pd.DataFrame({"temp": [1.0, 2.0, 3.0, 4.0, 5.0, 6.0]}, index=range(2001, 2007))
    difference, p = pair(need(ctx.module(), "compare")(years, "temp", (2001, 2003), (2004, 2006), shuffles=4000), "compare")
    close(difference, 3.0, "The difference for three years against the next three")
    close(p, 0.1, "p for 1, 2, 3 against 4, 5, 6: 2 of the 20 ways to split them are as far apart", tol=0.03)


def same_every_run(ctx):
    module, years = years_of(ctx)
    first = pair(need(module, "compare")(years, "rain", EARLY, LATE, shuffles=500, seed=7), "compare")
    second = pair(need(module, "compare")(years, "rain", EARLY, LATE, shuffles=500, seed=7), "compare")
    if float(first[1]) != float(second[1]):
        raise CheckFailed("With the same seed, compare should give the same p every time. Make the generator from the seed inside compare.",
                          expected=repr(first[1]), actual=repr(second[1]))


def nothing_changed(ctx):
    module, station = book(ctx)
    before = station.copy()
    years = need(module, "yearly")(station)
    need(module, "normals")(station, 1961, 1990)
    if not station.equals(before):
        raise CheckFailed("yearly or normals changed the station book it was given.")
    kept = years.copy()
    need(module, "decades")(years)
    need(module, "trend")(years, "sun")
    need(module, "compare")(years, "sun", EARLY, LATE, shuffles=50)
    if not years.equals(kept):
        raise CheckFailed("decades, trend or compare changed the table it was given. Leave out the missing years from a copy.")


TESTS = [
    custom("A year at a time", a_year_at_a_time, visible=True),
    custom("The warming trend", warming, visible=True),
    custom("A year with a month missing", missing_month,
           hint="sum(min_count=12) gives NaN unless there are twelve readings. For the mean, count() says how many there were."),
    custom("Decade by decade", by_decade, hint="years.index // 10 * 10 turns 1987 into 1980. Group by that."),
    custom("The 1961 to 1990 normals", normal_months),
    custom("Rain and sunshine trends", other_trends, hint="np.polyfit can't cope with NaN. dropna() first, then fit."),
    custom("Warmer than it was", warmer),
    custom("Wetter, or sunnier", wetter,
           hint="Count the shuffles whose difference is at least as far from 0 as the real one, either side: compare abs() with abs()."),
    custom("Three years against three", six_years),
    custom("The same every run", same_every_run),
    custom("Nothing it's given is changed", nothing_changed),
]
