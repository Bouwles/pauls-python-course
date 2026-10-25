import math as _math

import numpy as _np

NEEDED = ("load_days", "hours", "add_features", "feature_table")
FEATURES = ["wind_speed", "wind_east", "wind_north", "pressure_change", "sea_temp",
            "swell", "tide_range", "from_dawn", "cloud", "rain"]


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"features.py needs a function called {name}. The list is in the step.")
    return mod


def _small():
    import pandas as pd
    return pd.DataFrame({
        "date": ["2026-03-01", "2026-03-02", "2026-03-03"],
        "wind_speed": [10, 20, 0],
        "wind_dir": [90, 180, 45],
        "pressure": [1010, 1004, 1007],
        "sea_temp": [9.5, 9.6, 9.4],
        "cloud": [3, 8, 0],
        "rain": [0.0, 6.5, 0.0],
        "swell": [0.8, 2.4, 0.5],
        "tide_range": [4.6, 4.2, 3.9],
        "high_water": ["06:00", "09:30", "02:45"],
        "boats_out": [7, 1, 8],
        "boxes_per_boat": [11, 3, 8],
    })


def clock(ctx):
    mod = _module(ctx, "hours")
    for text, want in (("06:42", 6.7), ("00:15", 0.25), ("11:30", 11.5)):
        got = mod.hours(text)
        if got is None or abs(float(got) - want) > 1e-9:
            raise CheckFailed(f"{text} is {want} hours after midnight.", expected=want, actual=got)


def added(ctx):
    mod = _module(ctx, "hours", "add_features")
    days = _small()
    before = days.copy()
    got = mod.add_features(days)
    if got is None:
        raise CheckFailed("add_features gave back None. It should return a new DataFrame.")
    if not days.equals(before):
        raise CheckFailed("add_features changed the DataFrame it was given. Work on days.copy().")
    for column in ("wind_east", "wind_north", "from_dawn", "pressure_change", "good"):
        if column not in got.columns:
            raise CheckFailed(f"There's no {column} column.", expected=column, actual=list(got.columns))
    checks = [
        ("wind_east", [10.0, 0.0, 0.0], "A 10-knot wind from 90 degrees is all east: sin(90 degrees) is 1."),
        ("wind_north", [0.0, -20.0, 0.0], "A 20-knot wind from 180 degrees is all north, negatively: cos(180 degrees) is -1."),
        ("from_dawn", [0.0, 3.5, 3.25], "High water at 09:30 is 3.5 hours from 06:00; at 02:45, 3.25 hours."),
        ("good", [1, 0, 1], "Eight boxes or more is a good day, so 11 and 8 are good and 3 isn't."),
    ]
    for column, want, why in checks:
        values = _np.asarray(got[column], dtype=float)
        if not _np.allclose(values, want, atol=1e-9):
            raise CheckFailed(why, expected=want, actual=_np.round(values, 3).tolist())
    change = _np.asarray(got["pressure_change"], dtype=float)
    if not (_math.isnan(change[0]) and _np.allclose(change[1:], [-6.0, 3.0])):
        raise CheckFailed("Today's pressure minus yesterday's: unknown on the first day, then -6, then 3.",
                          expected="[nan, -6.0, 3.0]", actual=change.tolist())


def loads(ctx):
    mod = _module(ctx, "load_days")
    days = mod.load_days("fishing.csv")
    if days is None or len(days) != 1096 or "high_water" not in days.columns:
        raise CheckFailed("Three years of the log, one row per day: 1096 rows, with every column of the file.",
                          expected=1096, actual=None if days is None else len(days))


def features_list(ctx):
    mod = ctx.module()
    got = getattr(mod, "FEATURES", None)
    if got != FEATURES:
        raise CheckFailed("FEATURES should be the ten dawn columns, in the order the step gives.", expected=FEATURES, actual=got)


def table(ctx):
    mod = _module(ctx)
    days = mod.add_features(mod.load_days("fishing.csv"))
    result = mod.feature_table(days)
    try:
        X, y = result
    except (TypeError, ValueError):
        raise CheckFailed("feature_table should return two things: X and y.", actual=repr(result)[:200])
    if list(X.columns) != FEATURES:
        raise CheckFailed("X holds the FEATURES columns and nothing else.", expected=FEATURES, actual=list(X.columns))
    if len(X) != 1095 or len(y) != 1095:
        raise CheckFailed("Every day but the first has all ten features: 1095 rows.", expected=1095, actual=f"{len(X)} and {len(y)}")
    if X.isna().any().any():
        raise CheckFailed("X still has missing values. Leave out any row with a feature missing.")
    if abs(float(_np.mean(y)) - 0.4338) > 0.001:
        raise CheckFailed("y is the good column for the same rows.", expected=0.434, actual=round(float(_np.mean(y)), 3))


def no_leaks(ctx):
    mod = ctx.module()
    got = list(getattr(mod, "FEATURES", []) or [])
    for column in ("boats_out", "boxes_per_boat", "good"):
        if column in got:
            raise CheckFailed(f"{column} isn't known at dawn, so it can't be a feature.")


def compass(ctx):
    import pandas as pd

    mod = _module(ctx, "hours", "add_features")
    days = _small().iloc[:2].copy()
    days["wind_speed"] = [15, 15]
    days["wind_dir"] = [350, 10]
    got = mod.add_features(days)
    a = _np.array([got["wind_east"].iloc[0], got["wind_north"].iloc[0]], dtype=float)
    b = _np.array([got["wind_east"].iloc[1], got["wind_north"].iloc[1]], dtype=float)
    if _np.linalg.norm(a - b) > 6:
        raise CheckFailed("Winds from 350 and 10 degrees are nearly the same wind, so their arrows should be close.",
                          actual=f"{_np.round(a, 2).tolist()} and {_np.round(b, 2).tolist()}")


def summary(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    for want in ("Days in the log: 1096", "Days with every feature: 1095", "Good days: 0.43"):
        if want not in result.output:
            raise CheckFailed("Run as a program, it prints the three lines in the step.", expected=want, actual=result.output)


TESTS = [
    custom("hours turns a clock time into hours", clock, visible=True),
    custom("add_features adds the five new columns", added, visible=True,
           hint="Use np.radians on wind_dir before np.sin and np.cos, and .diff() for the pressure's change."),
    custom("load_days reads all 1096 days", loads),
    custom("FEATURES lists the ten dawn columns", features_list),
    custom("Nothing in FEATURES is known only after dawn", no_leaks),
    custom("feature_table gives the ten features and good, with nothing missing", table,
           hint="If only this fails, drop the rows with a missing feature before taking X and y."),
    custom("Winds from 350 and 10 degrees come out as neighbours", compass),
    custom("Prints the summary", summary),
]
