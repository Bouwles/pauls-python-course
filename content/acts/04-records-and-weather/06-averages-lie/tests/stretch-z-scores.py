def small(ctx):
    import pandas as pd

    readings = pd.Series([10.0, 12.0, 14.0], index=["a", "b", "c"])
    result = ctx.module().z_scores(readings)
    if not isinstance(result, pd.Series) or list(result.index) != ["a", "b", "c"]:
        raise CheckFailed("z_scores should give back a Series with the same labels.")
    if [round(float(v), 6) for v in result] != [-1.0, 0.0, 1.0]:
        raise CheckFailed("10, 12 and 14 are one standard deviation below the mean, on it, and one above.",
                          expected="[-1.0, 0.0, 1.0]", actual=str(result.tolist()))


def screen_door(ctx):
    import io

    import pandas as pd

    temps = pd.read_csv(io.StringIO(ctx.files["daily.csv"]), index_col="date")["temp"]
    result = ctx.module().z_scores(temps)
    expected = (41.3 - temps.mean()) / temps.std()
    if abs(float(result["2024-06-14"]) - expected) > 1e-6:
        raise CheckFailed("The screen door's z-score.", expected=f"{expected:.2f}", actual=f"{float(result['2024-06-14']):.2f}")


TESTS = [
    custom("Three readings", small, visible=True),
    custom("The screen door", screen_door),
]
