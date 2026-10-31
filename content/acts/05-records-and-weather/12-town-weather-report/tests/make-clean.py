COLUMNS = ["year", "month", "temp", "rain", "sun"]

SMALL = """month,temp,unit,rain,sun
2002-02,5.1,C,80.0,61.5
2001-1,41.0,F,120.5,away
2001-02,42.8, f,95.0,away
2001-02,42.8,F ,95.0,away
2001-3,7.2,c,70.25,110.0
2002-01,4.4,C ,101.0,50.5
"""

GAPPY = """month,temp,unit,rain,sun
2001-11,7.0,C,90.0,55.0
2002-02,5.0,C,80.0,60.0
2001-12,41.0,F,100.0,40.0
2002-04,8.5,C,60.0,150.0
"""


def need(module, name):
    """The learner's function, or a clear message that it isn't there yet."""
    function = getattr(module, name, None)
    if not callable(function):
        raise CheckFailed("station.py needs a function called " + name + ".")
    return function


def cleaned(ctx, path="ledger.csv", files=None):
    import pandas as pd

    module = ctx.module(files=files)
    station = need(module, "load_station")(path)
    if not isinstance(station, pd.DataFrame):
        raise CheckFailed("load_station should give back a DataFrame.", actual=type(station).__name__)
    if list(station.columns) != COLUMNS:
        raise CheckFailed("The cleaned station book should have these five columns, in this order.",
                          expected=str(COLUMNS), actual=str(list(station.columns)))
    return station


def same(actual, expected, what, tol=1e-6):
    import math

    if isinstance(expected, float) and math.isnan(expected):
        if not (isinstance(actual, float) and math.isnan(actual)):
            raise CheckFailed(f"{what} should be missing.", expected="nan", actual=repr(actual))
        return
    try:
        ok = abs(float(actual) - expected) <= tol
    except (TypeError, ValueError):
        ok = False
    if not ok:
        raise CheckFailed(f"{what} is wrong.", expected=repr(expected), actual=repr(actual))


def month_row(station, year, month):
    rows = station[(station["year"] == year) & (station["month"] == month)]
    if len(rows) != 1:
        raise CheckFailed(f"{year}-{month:02d} should appear exactly once.", expected=1, actual=len(rows))
    return rows.iloc[0]


def the_book(ctx):
    import pandas as pd

    station = cleaned(ctx)
    if len(station) != 1200:
        raise CheckFailed("A hundred years is 1200 months, each once.", expected=1200, actual=len(station))
    for column in ["year", "month"]:
        if not pd.api.types.is_integer_dtype(station[column]):
            raise CheckFailed(f"{column} should be whole numbers.", actual=str(station[column].dtype))
    for column in ["temp", "rain", "sun"]:
        if not pd.api.types.is_float_dtype(station[column]):
            raise CheckFailed(f"{column} should be numbers, not text.", actual=str(station[column].dtype))


def fahrenheit(ctx):
    import pandas as pd

    module = ctx.module()
    need(module, "to_celsius")
    same(module.to_celsius(32), 0.0, "to_celsius(32)")
    same(module.to_celsius(212), 100.0, "to_celsius(212)")
    column = module.to_celsius(pd.Series([50.0, 14.0]))
    if not isinstance(column, pd.Series) or column.round(6).tolist() != [10.0, -10.0]:
        raise CheckFailed("to_celsius should work on a whole column at once.", expected="[10.0, -10.0]", actual=repr(column))
    same(month_row(cleaned(ctx), 1925, 1)["temp"], 6.5, "January 1925's temperature, written 43.7 F,")


def every_temperature(ctx):
    station = cleaned(ctx)
    same(month_row(station, 1960, 12)["temp"], 8.9, "December 1960, the last month in Fahrenheit,", tol=1e-9)
    same(month_row(station, 1961, 1)["temp"], 6.7, "January 1961, the first in Celsius,", tol=1e-9)
    same(round(station["temp"].sum(), 1), 13596.3, "All 1200 temperatures added up", tol=1e-6)


def recorder_away(ctx):
    station = cleaned(ctx)
    missing = station[station["sun"].isna()]
    if len(missing) != 60 or set(missing["year"]) != {1941, 1942, 1943, 1944, 1945}:
        raise CheckFailed("Sunshine should be missing for the 60 months the recorder was away, 1941 to 1945, and nowhere else.",
                          expected="60 months, 1941 to 1945", actual=f"{len(missing)} months")
    same(round(station["sun"].sum(), 1), 154366.8, "All the sunshine that was measured, added up")


def each_month_once(ctx):
    station = cleaned(ctx)
    repeats = station.duplicated(subset=["year", "month"]).sum()
    if repeats:
        raise CheckFailed("Some months appear more than once.", expected=0, actual=int(repeats))
    month_row(station, 1958, 3)
    month_row(station, 1966, 11)


def in_order(ctx):
    station = cleaned(ctx)
    if list(station.index) != list(range(len(station))):
        raise CheckFailed("The rows should be labelled 0, 1, 2 and so on.", actual=str(list(station.index[:5])))
    order = list(zip(station["year"], station["month"]))
    if order != sorted(order):
        raise CheckFailed("The months should be in order, earliest first.")
    row = station.loc[744]
    if (int(row["year"]), int(row["month"])) != (1987, 1):
        raise CheckFailed("Row 744 should be January 1987: the 1987 pages were typed last, but they belong in their place.",
                          expected="1987-01", actual=f"{int(row['year'])}-{int(row['month']):02d}")


def small_ledger(ctx):
    import math

    station = cleaned(ctx, "small.csv", files={"small.csv": SMALL})
    want = [
        (2001, 1, 5.0, 120.5, math.nan),
        (2001, 2, 6.0, 95.0, math.nan),
        (2001, 3, 7.2, 70.25, 110.0),
        (2002, 1, 4.4, 101.0, 50.5),
        (2002, 2, 5.1, 80.0, 61.5),
    ]
    if len(station) != len(want):
        raise CheckFailed("A small ledger of five months, one typed twice, should clean to five rows.", expected=5, actual=len(station))
    for (_, row), expected in zip(station.iterrows(), want):
        where = f"{expected[0]}-{expected[1]:02d}"
        if (int(row["year"]), int(row["month"])) != expected[:2]:
            raise CheckFailed("The small ledger's months are in the wrong order.", expected=where, actual=f"{row['year']}-{row['month']}")
        for column, value in zip(["temp", "rain", "sun"], expected[2:]):
            same(row[column], value, f"{column} for {where} in a small ledger")
    if list(station.index) != [0, 1, 2, 3, 4]:
        raise CheckFailed("The rows should be labelled 0 to 4.", actual=str(list(station.index)))


def no_gaps(ctx):
    module = ctx.module()
    got = need(module, "missing_months")(need(module, "load_station")("ledger.csv"))
    if got != []:
        raise CheckFailed("Nothing is missing from the station book.", expected="[]", actual=repr(got))


def gaps(ctx):
    module = ctx.module(files={"gappy.csv": GAPPY})
    got = need(module, "missing_months")(need(module, "load_station")("gappy.csv"))
    if got != ["2002-01", "2002-03"]:
        raise CheckFailed("missing_months on a ledger from November 2001 to April 2002 with two months gone.",
                          expected="['2002-01', '2002-03']", actual=repr(got))


TESTS = [
    custom("The station book, cleaned", the_book, visible=True),
    custom("Fahrenheit into Celsius", fahrenheit, visible=True),
    custom("Every temperature in Celsius", every_temperature,
           hint="Round the converted temperatures to one decimal place, as the book was kept. The unit column has some f's, and some spaces."),
    custom("The sunshine recorder was away", recorder_away,
           hint="pd.to_numeric(column, errors=\"coerce\") turns away into NaN."),
    custom("Each month once", each_month_once,
           hint="Some months were typed twice, once with the unit written differently. Drop the duplicates after the cleaning, when the copies look alike."),
    custom("In order, labelled from 0", in_order),
    custom("A small ledger of its own", small_ledger,
           hint="Use the path you're given, and nothing about the Archive's ledger. 2001-1 is January, and F can be written f."),
    custom("Nothing missing from the station book", no_gaps),
    custom("Two months missing", gaps,
           hint="Count from the first month to the last, one month at a time, going from December to January of the next year."),
]
