KEYS = ["mean", "median", "mode", "std", "q1", "q3"]


def daily(ctx):
    import io

    import pandas as pd

    return pd.read_csv(io.StringIO(ctx.files["daily.csv"]), index_col="date")


def week():
    import pandas as pd

    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return pd.Series([0.0, 31.0, 0.0, 0.4, 1.2, 0.0, 2.0], index=days)


def check_summary(result, expected, what):
    if not isinstance(result, dict):
        raise CheckFailed(f"{what} should give back a dictionary.", actual=type(result).__name__)
    if sorted(result) != sorted(KEYS):
        raise CheckFailed(f"{what} should have exactly these keys.", expected=str(KEYS), actual=str(list(result)))
    for key in KEYS:
        try:
            value = float(result[key])
        except (TypeError, ValueError):
            raise CheckFailed(f"{what}: {key} should be a number.", actual=repr(result[key]))
        if abs(value - expected[key]) > 1e-6:
            raise CheckFailed(f"{what}: {key} is wrong.", expected=f"{expected[key]:.4f}", actual=f"{value:.4f}")


def expected_for(values):
    return {
        "mean": float(values.mean()),
        "median": float(values.median()),
        "mode": float(values.mode().iloc[0]),
        "std": float(values.std()),
        "q1": float(values.quantile(0.25)),
        "q3": float(values.quantile(0.75)),
    }


def a_week(ctx):
    expected = {"mean": 34.6 / 7, "median": 0.4, "mode": 0.0, "std": float(week().std()), "q1": 0.0, "q3": 1.6}
    check_summary(ctx.module().summary(week()), expected, "summary of a week of rain")


def oven(ctx):
    import pandas as pd

    days = [f"{day} May" for day in range(1, 10)]
    times = pd.Series([38, 40, 41, 39, 42, 95, 40, 37, 41], index=days)
    module = ctx.module()
    low, high = module.fences(times)
    if abs(low - 36.0) > 1e-9 or abs(high - 44.0) > 1e-9:
        raise CheckFailed("Quartiles 39 and 41 make a middle half 2 wide, so the fences are 3 below and 3 above them.",
                          expected="(36.0, 44.0)", actual=f"({low}, {high})")
    found = module.outliers(times)
    if not isinstance(found, pd.Series):
        raise CheckFailed("outliers should give back a Series, so each reading keeps its label.", actual=type(found).__name__)
    if found.to_dict() != {"6 May": 95}:
        raise CheckFailed("Only the 95 minutes on 6 May is outside the fences.", expected="{'6 May': 95}", actual=str(found.to_dict()))


def sample_spread(ctx):
    import pandas as pd

    result = ctx.module().summary(pd.Series([10.0, 12.0, 14.0]))
    if abs(float(result["std"]) - 2.0) > 1e-9:
        raise CheckFailed("The standard deviation of 10, 12 and 14 is 2.0 the way pandas works it out, dividing by one less than the count.",
                          expected="2.0", actual=f"{float(result['std']):.4f}")


def tied_mode(ctx):
    import pandas as pd

    result = ctx.module().summary(pd.Series([3.0, 1.0, 3.0, 1.0, 2.0]))
    if float(result["mode"]) != 1.0:
        raise CheckFailed("1 and 3 both turn up twice. mode() gives both, smallest first: take the first.",
                          expected="1.0", actual=repr(result["mode"]))


def home_town(ctx):
    temps = daily(ctx)["temp"]
    check_summary(ctx.module().summary(temps), expected_for(temps), "summary of the {{town}} temperatures")


def thornby(ctx):
    temps = daily(ctx)["thornby"]
    check_summary(ctx.module().summary(temps), expected_for(temps), "summary of the Thornby temperatures")


def screen_door(ctx):
    found = ctx.module().outliers(daily(ctx)["temp"])
    if list(found.index) != ["2024-06-14"] or float(found.iloc[0]) != 41.3:
        raise CheckFailed("One {{town}} temperature is outside the fences.", expected="{'2024-06-14': 41.3}", actual=str(found.to_dict()))


def rainy_days(ctx):
    found = ctx.module().outliers(daily(ctx)["rain"])
    if len(found) != 38:
        raise CheckFailed("Count the days above the high fence, and any below the low one.", expected=38, actual=len(found))


def low_ones(ctx):
    import pandas as pd

    readings = pd.Series([20.0, 21.0, 22.0, 21.0, 20.0, 2.0, 21.5])
    found = ctx.module().outliers(readings)
    if found.tolist() != [2.0]:
        raise CheckFailed("A reading far below the low fence is outside too.", expected="[2.0]", actual=str(found.tolist()))


def dry(ctx):
    module = ctx.module()
    rain = daily(ctx)["rain"]
    count = module.dry_days(rain)
    if count != 160:
        raise CheckFailed("Days with less than 0.2 mm.", expected=160, actual=count)
    count = module.dry_days(week(), 1.0)
    if count != 4:
        raise CheckFailed("With a threshold of 1.0 mm, four days of the week were dry.", expected=4, actual=count)


def left_alone(ctx):
    table = daily(ctx)
    before = table.copy()
    module = ctx.module()
    for column in ["rain", "temp", "thornby"]:
        module.summary(table[column])
        module.fences(table[column])
        module.outliers(table[column])
    module.dry_days(table["rain"])
    if not table.equals(before):
        raise CheckFailed("One of the functions changed the readings it was given. Nobody writes on the station book.")


TESTS = [
    custom("A summary of a week of rain", a_week, visible=True),
    custom("Bea's oven, and the morning the gas was off", oven, visible=True),
    custom("The standard deviation divides by one less than the count", sample_spread,
           hint="numpy's np.std divides by the count; pandas' .std() divides by one less. Use the pandas one."),
    custom("A tie for the most common value", tied_mode, hint="values.mode() is a Series, smallest first. .iloc[0] takes the first."),
    custom("A year of {{town}} temperatures", home_town),
    custom("A year of Thornby temperatures", thornby),
    custom("The screen door in June", screen_door, hint="outliers should give back the readings with their labels, the dates."),
    custom("Rain outside the fences", rainy_days),
    custom("A reading below the low fence", low_ones,
           hint="Outside the fences means below the low one or above the high one: two conditions, joined with |."),
    custom("Dry days", dry, hint="Count the days with less than the threshold. The threshold is 0.2 mm unless you're given another."),
    custom("The readings are left as they were", left_alone),
]
