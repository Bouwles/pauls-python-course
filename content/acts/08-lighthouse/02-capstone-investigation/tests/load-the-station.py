COLUMNS = ["year", "month", "tmax", "tmin", "frost_days", "rain", "sun", "estimated", "sun_sensor", "provisional"]
MEASURES = ["tmax", "tmin", "frost_days", "rain", "sun"]
GAPS = {"tmax": 3, "tmin": 6, "frost_days": 6, "rain": 2, "sun": 668}

# Smaller files from two other stations: one with more lines of notes before
# the table than Stornoway's, one with fewer, as the Met Office's files vary.
OTHER_STATION = """Gullhaven / Gullhaven Pier from March 1998
Location 123400E 567800N 12m amsl to Feb 1998
& from March 1998 123500E 567900N, Lat 55.000 Lon -2.000, 9m amsl
Estimated data is marked with a * after the value.
Missing data (more than 2 days missing in month) is marked by  ---.
Sunshine data taken from an automatic Kipp & Zonen sensor marked with a #, otherwise sunshine data taken from a Campbell Stokes recorder.
   yyyy  mm   tmax    tmin      af    rain     sun
              degC    degC    days      mm   hours
   1998   1    6.1     1.2    ---     88.0    ---
   1998   2    7.0     2.2       3    61.4    52.0
   1998   3    9.4*    3.0       1   102.3    90.5
   1998   4   11.2     4.1       0     ---   140.2#
   1998   5   14.8     6.6       0    40.0   201.7#  Provisional
"""
SHORTER_STATION = """Hollow Point
Location: 200000E 600000N, Lat 55.500 Lon -3.000, 40 metres amsl
Missing data (more than 2 days missing in month) is marked by  ---.
   yyyy  mm   tmax    tmin      af    rain     sun
              degC    degC    days      mm   hours
   2001   3    8.8     2.0       4    70.1   101.0
   2001   4   10.2     3.3       1     ---   150.2
   2001   5   13.0     5.9       0    48.3   188.8
"""


def _station_module(ctx, files=None):
    ctx.module(files=files)
    import station

    return station


def _station(ctx, path="stornowaydata.txt", files=None):
    import pandas as pd

    station = _station_module(ctx, files)
    if not callable(getattr(station, "load_station", None)):
        raise CheckFailed("station.py needs a function called load_station(path).")
    table = station.load_station(path)
    if not isinstance(table, pd.DataFrame):
        raise CheckFailed("load_station should give back a DataFrame.", actual=type(table).__name__)
    return table


def _floats(values):
    import math

    return ["NaN" if isinstance(v, float) and math.isnan(v) else v for v in values]


def clean_four(ctx):
    import pandas as pd

    station = _station_module(ctx)
    if not callable(getattr(station, "clean_column", None)):
        raise CheckFailed("station.py needs a function called clean_column(texts).")
    got = station.clean_column(pd.Series(["8.4", "3.2*", "---", "47.1#"]))
    if not isinstance(got, pd.Series) or not pd.api.types.is_float_dtype(got):
        raise CheckFailed("clean_column should give back a Series of floats.", actual=repr(got)[:200])
    values = _floats(got.tolist())
    if values != [8.4, 3.2, "NaN", 47.1]:
        raise CheckFailed("Take the marks off, and turn --- into NaN.", expected="[8.4, 3.2, NaN, 47.1]", actual=str(values))


def shape(ctx):
    table = _station(ctx)
    if list(table.columns) != COLUMNS:
        raise CheckFailed("The columns, in this order: " + ", ".join(COLUMNS) + ".",
                          expected=str(COLUMNS), actual=str(list(table.columns)))
    if len(table) != 1839:
        raise CheckFailed("One row for every month from July 1873 to September 2026.", expected="1839 rows", actual=f"{len(table)} rows")


def labels(ctx):
    import pandas as pd

    table = _station(ctx)
    if not table.index.equals(pd.RangeIndex(len(table))):
        raise CheckFailed("The rows should be labelled 0, 1, 2 and so on. reset_index(drop=True) does it.",
                          actual=str(table.index.tolist()[:6]) + " ...")


def types(ctx):
    import pandas as pd

    table = _station(ctx)
    for name in ("year", "month"):
        if not pd.api.types.is_integer_dtype(table[name]):
            raise CheckFailed(f"{name} should be whole numbers.", actual=str(table[name].dtype))
    for name in MEASURES:
        if not pd.api.types.is_float_dtype(table[name]):
            raise CheckFailed(f"{name} should be floats, with NaN for the gaps.", actual=str(table[name].dtype))
    for name in ("estimated", "sun_sensor", "provisional"):
        if not pd.api.types.is_bool_dtype(table[name]):
            raise CheckFailed(f"{name} should be True or False on every row.", actual=str(table[name].dtype))


def gaps(ctx):
    table = _station(ctx)
    got = {name: int(table[name].isna().sum()) for name in MEASURES}
    if got != GAPS:
        raise CheckFailed("Count the gaps in each column: only --- should become NaN.", expected=str(GAPS), actual=str(got))


def flags(ctx):
    table = _station(ctx)
    got = (int(table["estimated"].sum()), int(table["sun_sensor"].sum()), int(table["provisional"].sum()))
    if got != (4, 285, 9):
        raise CheckFailed("Four rows have an estimated value, 285 have sunshine from the sensor, and nine are provisional.",
                          expected="estimated 4, sun_sensor 285, provisional 9",
                          actual=f"estimated {got[0]}, sun_sensor {got[1]}, provisional {got[2]}")


def _row(table, year, month):
    match = table[(table["year"] == year) & (table["month"] == month)]
    if len(match) != 1:
        raise CheckFailed(f"There should be exactly one row for {month}/{year}.", actual=f"{len(match)} rows")
    return match.iloc[0]


def values(ctx):
    table = _station(ctx)
    cases = [
        (1873, 7, {"tmax": 16.7, "tmin": 9.9, "frost_days": 0.0, "rain": 110.5, "sun": "NaN",
                   "estimated": False, "sun_sensor": False, "provisional": False}),
        (2009, 4, {"tmax": 12.5, "tmin": 5.9, "frost_days": 1.0, "rain": 71.0, "sun": 151.2,
                   "estimated": True, "sun_sensor": True, "provisional": False}),
        (2026, 9, {"tmax": 15.3, "tmin": 10.1, "frost_days": 0.0, "rain": 140.6, "sun": 94.0,
                   "estimated": False, "sun_sensor": True, "provisional": True}),
    ]
    for year, month, want in cases:
        row = _row(table, year, month)
        got = dict(zip(want, _floats([row[name].item() if hasattr(row[name], "item") else row[name] for name in want])))
        if got != want:
            raise CheckFailed(f"The row for {month}/{year} is off.", expected=str(want), actual=str(got))


def other_station(ctx):
    table = _station(ctx, "gullhaven.txt", files={"gullhaven.txt": OTHER_STATION})
    if len(table) != 5 or list(table.columns) != COLUMNS:
        raise CheckFailed("Another station's file, with an extra line of notes at the top, should load too: five months.",
                          expected=f"5 rows, {COLUMNS}", actual=f"{len(table)} rows, {list(table.columns)}")
    got = {
        "frost_days": _floats(table["frost_days"].tolist()),
        "rain": _floats(table["rain"].tolist()),
        "estimated": [bool(v) for v in table["estimated"]],
        "sun_sensor": [bool(v) for v in table["sun_sensor"]],
        "provisional": [bool(v) for v in table["provisional"]],
    }
    want = {
        "frost_days": ["NaN", 3.0, 1.0, 0.0, 0.0],
        "rain": [88.0, 61.4, 102.3, "NaN", 40.0],
        "estimated": [False, False, True, False, False],
        "sun_sensor": [False, False, False, True, True],
        "provisional": [False, False, False, False, True],
    }
    for name in want:
        if got[name] != want[name]:
            raise CheckFailed(f"Gullhaven's {name} column is off.", expected=str(want[name]), actual=str(got[name]))

    table = _station(ctx, "hollow.txt", files={"hollow.txt": SHORTER_STATION})
    got = [(int(year), int(month)) for year, month in zip(table["year"], table["month"])]
    if got != [(2001, 3), (2001, 4), (2001, 5)] or _floats(table["rain"].tolist()) != [70.1, "NaN", 48.3]:
        raise CheckFailed("Hollow Point's file has fewer lines of notes. Its three months should all load, starting with March 2001.",
                          expected="(2001, 3), (2001, 4), (2001, 5)", actual=", ".join(map(str, got)))


def rain_stornoway(ctx):
    import math

    table = _station(ctx)
    import station

    if not callable(getattr(station, "annual_rain", None)):
        raise CheckFailed("station.py needs a function called annual_rain(station).")
    totals = station.annual_rain(table)
    if len(totals) != 154 or totals.index[0] != 1873 or totals.index[-1] != 2026:
        raise CheckFailed("One total for every year from 1873 to 2026, indexed by year.",
                          expected="154 years, 1873 to 2026", actual=f"{len(totals)} values, {totals.index[0]} to {totals.index[-1]}")
    if abs(float(totals[1874]) - 1352.9) > 0.05 or abs(float(totals[2025]) - 1101.5) > 0.05:
        raise CheckFailed("Add up the twelve months of each year.", expected="1874: 1352.9, 2025: 1101.5",
                          actual=f"1874: {float(totals[1874]):.1f}, 2025: {float(totals[2025]):.1f}")
    missing = [int(year) for year, total in totals.items() if math.isnan(total)]
    if missing != [1873, 1880, 1883, 2026]:
        raise CheckFailed("A year without all twelve months of rain has no honest total: leave it missing.",
                          expected="[1873, 1880, 1883, 2026]", actual=str(missing))


def rain_small(ctx):
    import math

    import numpy as np
    import pandas as pd

    station = _station_module(ctx)
    if not callable(getattr(station, "annual_rain", None)):
        raise CheckFailed("station.py needs a function called annual_rain(station).")
    table = pd.DataFrame({"year": [2001] * 12 + [2002] * 12 + [2003] * 3,
                          "month": list(range(1, 13)) * 2 + [1, 2, 3],
                          "rain": [10.0] * 12 + [5.0] * 11 + [np.nan] + [1.0] * 3})
    totals = station.annual_rain(table)
    got = [None if math.isnan(v) else round(float(v), 1) for v in totals.tolist()]
    if list(totals.index) != [2001, 2002, 2003] or got != [120.0, None, None]:
        raise CheckFailed("2001 is complete; 2002 has a gap; 2003 has only three months.",
                          expected="2001: 120.0, 2002: NaN, 2003: NaN", actual=str(dict(zip(totals.index, got))))


TESTS = [
    custom("clean_column reads 8.4, 3.2*, --- and 47.1#", clean_four, visible=True),
    custom("load_station gives 1839 months in the agreed columns", shape, visible=True),
    custom("The rows are labelled 0, 1, 2 and so on", labels),
    custom("Whole numbers, floats and True or False", types),
    custom("Gaps stay gaps", gaps,
           hint="If only this fails, check that --- becomes NaN and that no real number does."),
    custom("The marks become columns", flags,
           hint="If only this fails: estimated is True when a * follows any of the five values in the row, not just one of them."),
    custom("Three months, value by value", values),
    custom("Other stations' files load too", other_station,
           hint="If only this fails, you're counting the lines before the table. Find the line that starts with yyyy instead."),
    custom("annual_rain on Stornoway", rain_stornoway,
           hint="If only this fails, remember pandas' sum() skips gaps. sum(min_count=12) refuses to add up fewer than twelve."),
    custom("annual_rain on a small table", rain_small),
]
