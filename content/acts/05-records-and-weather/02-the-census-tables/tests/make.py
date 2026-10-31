SMALL = """year,parish,household,name,relation,age,occupation
1901,Bankside,1,Jory Pascoe,head,61,fisherman
1901,Bankside,1,Wenna Pascoe,wife,58,net maker
1901,Bankside,2,Sam Kitto,head,30,fisherman
1901,Church Street,3,Ann Rowe,head,45,baker
1901,Church Street,3,Ned Rowe,son,19,baker
1901,Hill,4,Loveday Jago,head,72,retired
1911,Bankside,1,Sam Kitto,head,40,fisherman
1911,Northgate,2,Ned Rowe,head,29,baker
"""


def load(text):
    import io

    import pandas as pd

    return pd.read_csv(io.StringIO(text))


def census(ctx):
    return load(ctx.files["census.csv"])


def same_rows(actual, expected, what):
    import pandas as pd

    if not isinstance(actual, pd.DataFrame):
        raise CheckFailed(f"{what} should give back a DataFrame.", actual=type(actual).__name__)
    if list(actual.columns) != list(expected.columns):
        raise CheckFailed(f"{what} has the wrong columns.", expected=str(list(expected.columns)), actual=str(list(actual.columns)))
    if len(actual) != len(expected):
        raise CheckFailed(f"{what} should have {len(expected)} rows.", expected=f"{len(expected)} rows", actual=f"{len(actual)} rows")
    a = actual.sort_values("name").reset_index(drop=True)
    e = expected.sort_values("name").reset_index(drop=True)
    if not a.equals(e):
        raise CheckFailed(f"{what} has the right number of rows, but not the right ones.",
                          expected=e.head().to_string(), actual=a.head().to_string())


def oldest_first(actual, what):
    if not actual["age"].is_monotonic_decreasing:
        raise CheckFailed(f"{what} should be sorted oldest first.", actual=str(actual["age"].tolist()))


def whole_number(actual, expected, what):
    import numpy as np

    if isinstance(actual, bool) or not isinstance(actual, (int, np.integer)):
        raise CheckFailed(f"{what} should give back a whole number.", expected=repr(expected), actual=repr(actual))
    if actual != expected:
        raise CheckFailed(f"{what} should give back {expected}.", expected=repr(expected), actual=repr(int(actual)))


def same_name(actual, expected, what):
    if not isinstance(actual, str):
        raise CheckFailed(f"{what} should give back a name, as text.", expected=repr(expected), actual=repr(actual))
    if actual != expected:
        raise CheckFailed(f"{what} should be {expected}.", expected=repr(expected), actual=repr(actual))


def same_counts(actual, expected, what):
    import pandas as pd

    if not isinstance(actual, pd.Series):
        raise CheckFailed(f"{what} should give back a Series.", actual=type(actual).__name__)
    counts = {str(k): int(v) for k, v in actual.items()}
    if counts != expected:
        raise CheckFailed(f"{what} has the wrong counts.", expected=repr(expected), actual=repr(counts))
    if not actual.is_monotonic_decreasing:
        raise CheckFailed(f"{what} should list the largest parish first.", actual=repr(counts))


def year_1951(ctx):
    table = census(ctx)
    same_rows(ctx.module().census_year(table, 1951), table[table["year"] == 1951], "census_year(census, 1951)")


def fishermen_1921(ctx):
    table = census(ctx)
    expected = table[(table["year"] == 1921) & (table["occupation"] == "fisherman")][["name", "parish", "age"]]
    result = ctx.module().trade(table, 1921, "fisherman")
    same_rows(result, expected, "trade(census, 1921, \"fisherman\")")
    oldest_first(result, "trade(census, 1921, \"fisherman\")")


def hill_1951(ctx):
    whole_number(ctx.module().parish_count(census(ctx), 1951, "Hill"), 18, "parish_count(census, 1951, \"Hill\")")


def bankside_2011(ctx):
    whole_number(ctx.module().parish_count(census(ctx), 2011, "Bankside"), 18, "parish_count(census, 2011, \"Bankside\")")


def oldest_people(ctx):
    table = census(ctx)
    module = ctx.module()
    same_name(module.oldest(table, 1951), "Walter Rook", "oldest(census, 1951)")
    same_name(module.oldest(table, 2011), "Albert Moyle", "oldest(census, 2011)")


def sizes_1981(ctx):
    expected = {"Bankside": 21, "Church Street": 18, "Northgate": 15, "Hill": 9}
    same_counts(ctx.module().parish_sizes(census(ctx), 1981), expected, "parish_sizes(census, 1981)")


def smaller_census(ctx):
    table = load(SMALL)
    module = ctx.module()
    same_rows(module.census_year(table, 1911), table[table["year"] == 1911], "census_year on a smaller census")
    whole_number(module.parish_count(table, 1901, "Bankside"), 3, "parish_count on a smaller census")
    bakers = module.trade(table, 1901, "baker")
    same_rows(bakers, table[(table["year"] == 1901) & (table["occupation"] == "baker")][["name", "parish", "age"]], "trade on a smaller census")
    oldest_first(bakers, "trade on a smaller census")
    same_name(module.oldest(table, 1911), "Sam Kitto", "oldest on a smaller census")
    same_counts(module.parish_sizes(table, 1901), {"Bankside": 3, "Church Street": 2, "Hill": 1}, "parish_sizes on a smaller census")


def no_census(ctx):
    table = census(ctx)
    module = ctx.module()
    same_rows(module.census_year(table, 1941), table[table["year"] == 1941], "census_year(census, 1941)")
    whole_number(module.parish_count(table, 1941, "Hill"), 0, "parish_count(census, 1941, \"Hill\")")


def nobody_in_trade(ctx):
    table = census(ctx)
    result = ctx.module().trade(table, 2011, "coastguard")
    same_rows(result, table[table["year"] == 1941][["name", "parish", "age"]], "trade(census, 2011, \"coastguard\")")


def census_untouched(ctx):
    table = census(ctx)
    before = table.copy()
    module = ctx.module()
    module.census_year(table, 1921)
    module.parish_count(table, 1921, "Northgate")
    module.trade(table, 1921, "baker")
    module.oldest(table, 1921)
    module.parish_sizes(table, 1921)
    if not table.equals(before):
        raise CheckFailed("One of the functions changed the census it was given. Sort or filter a copy, and keep the census as it came.")


TESTS = [
    custom("The 1951 census", year_1951, visible=True),
    custom("Fishermen in 1921, oldest first", fishermen_1921, visible=True),
    custom("On the Hill in 1951", hill_1951),
    custom("In Bankside in 2011", bankside_2011),
    custom("The oldest in 1951 and 2011", oldest_people,
           hint="Sort a year's people oldest first, then take the first name by position, with .iloc[0]. Its label could be anything."),
    custom("Parish sizes in 1981", sizes_1981, hint="value_counts() on the parish column counts each parish and puts the largest first."),
    custom("A smaller census", smaller_census,
           hint="Use the year, parish and occupation you're given. Nothing from the Archive's census should be written in."),
    custom("A year with no census", no_census,
           hint="There was no census in 1941. A filter that matches nothing gives an empty table, not an error, so the count is 0."),
    custom("Nobody in that trade", nobody_in_trade,
           hint="The neighbourhood had no coastguards by 2011. trade should still give back a table with name, parish and age, just with no rows."),
    custom("The census is left as it was", census_untouched,
           hint="sort_values gives back a sorted copy. Use that, rather than inplace=True, so the census you were given stays as it was."),
]
