def census(ctx):
    import io

    import pandas as pd

    return pd.read_csv(io.StringIO(ctx.files["census.csv"]))


def check_year(ctx, year, expected):
    import pandas as pd

    result = ctx.module().oldest_by_parish(census(ctx), year)
    if not isinstance(result, pd.Series):
        raise CheckFailed("oldest_by_parish should give back a Series.", actual=type(result).__name__)
    found = {str(k): v for k, v in result.items()}
    if found != expected:
        raise CheckFailed(f"The oldest in each parish in {year}.", expected=str(expected), actual=str(found))


def year_1921(ctx):
    check_year(ctx, 1921, {"Bankside": "Grace Jago", "Church Street": "Arthur Vosper", "Hill": "Albert Vosper", "Northgate": "John Tregear"})


def year_2011(ctx):
    check_year(ctx, 2011, {"Bankside": "Albert Moyle", "Church Street": "Kenneth Abbott", "Hill": "Thomas Vosper", "Northgate": "Lucy Angove"})


TESTS = [
    custom("The oldest in each parish in 1921", year_1921, visible=True),
    custom("The oldest in each parish in 2011", year_2011),
]
