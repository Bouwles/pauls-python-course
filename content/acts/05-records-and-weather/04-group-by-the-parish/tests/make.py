SMALL = """year,parish,household,name,relation,age,occupation
1901,Harbour,1,Jory Pascoe,head,61,fisherman
1901,Harbour,1,Wenna Pascoe,wife,58,net maker
1901,Harbour,2,Tom Kitto,head,30,fisherman
1901,Marsh,3,Ann Hollis,head,45,baker
1901,Marsh,3,Ned Hollis,son,19,cooper
1911,Harbour,1,Tom Kitto,head,40,fisherman
1911,Harbour,1,Jenny Kitto,wife,33,lacemaker
1911,Hill,2,Ned Hollis,head,29,cooper
1911,Hill,2,Mary Hollis,wife,27,home duties
1911,Hill,2,Ann Hollis,mother,55,retired
"""

SMALL_TRADES = """occupation,sector
baker,trade
cooper,trade
cooper,trade
fisherman,sea
home duties,at home
net maker,sea
retired,at home
tin miner,land
"""


def load(text):
    import io

    import pandas as pd

    return pd.read_csv(io.StringIO(text))


def census(ctx):
    return load(ctx.files["census.csv"])


def trades(ctx):
    return load(ctx.files["trades.csv"])


def grid(actual, rows, columns, values, what):
    """A table with these row labels, these column labels and these numbers."""
    import pandas as pd

    if not isinstance(actual, pd.DataFrame):
        raise CheckFailed(f"{what} should give back a DataFrame.", actual=type(actual).__name__)
    if [str(r) for r in actual.index] != rows:
        raise CheckFailed(f"{what} should have one row for each of these, in this order.", expected=str(rows), actual=str([str(r) for r in actual.index]))
    if [int(c) for c in actual.columns] != columns:
        raise CheckFailed(f"{what} should have the census years across the top, earliest first.", expected=str(columns), actual=str(list(actual.columns)))
    got = [[float(v) for v in row] for row in actual.to_numpy()]
    if got != [[float(v) for v in row] for row in values]:
        raise CheckFailed(f"{what} has the right rows and columns, but some of the numbers are wrong.",
                          expected="\n" + "\n".join(f"{r}: {v}" for r, v in zip(rows, values)),
                          actual="\n" + actual.to_string())


def parishes(ctx):
    grid(ctx.module().parish_table(census(ctx)),
         ["Harbour", "High Street", "Hill", "Marsh"], [1921, 1951, 1981, 2011],
         [[29, 35, 21, 18], [35, 31, 18, 25], [14, 18, 9, 12], [12, 14, 15, 13]],
         "parish_table(census)")


def summary(ctx):
    import pandas as pd

    result = ctx.module().year_summary(census(ctx))
    if not isinstance(result, pd.DataFrame):
        raise CheckFailed("year_summary should give back a DataFrame.", actual=type(result).__name__)
    if [int(y) for y in result.index] != [1921, 1951, 1981, 2011]:
        raise CheckFailed("year_summary should have one row per census year, earliest first.", actual=str(list(result.index)))
    wanted = ["people", "households", "average_age", "per_household"]
    if list(result.columns) != wanted:
        raise CheckFailed("year_summary should have these columns, in this order.", expected=str(wanted), actual=str(list(result.columns)))
    if [int(v) for v in result["people"]] != [90, 98, 63, 68]:
        raise CheckFailed("The people column is wrong.", expected="[90, 98, 63, 68]", actual=str(result["people"].tolist()))
    if [int(v) for v in result["households"]] != [23, 26, 26, 26]:
        raise CheckFailed("Count the different household numbers in each year, not the rows.", expected="[23, 26, 26, 26]", actual=str(result["households"].tolist()))
    ages = [27.1, 25.3, 39.5, 33.2]
    if any(abs(float(a) - e) > 0.051 for a, e in zip(result["average_age"], ages)):
        raise CheckFailed("The average_age column is wrong.", expected=str(ages), actual=str([round(float(a), 2) for a in result["average_age"]]))
    sizes = [90 / 23, 98 / 26, 63 / 26, 68 / 26]
    if any(abs(float(a) - e) > 0.0051 for a, e in zip(result["per_household"], sizes)):
        raise CheckFailed("per_household is the people divided by the households, for each year.",
                          expected=str([round(s, 2) for s in sizes]), actual=str([round(float(a), 2) for a in result["per_household"]]))


def sectors_column(ctx):
    import pandas as pd

    table = census(ctx)
    result = ctx.module().with_sectors(table, trades(ctx))
    if not isinstance(result, pd.DataFrame):
        raise CheckFailed("with_sectors should give back a DataFrame.", actual=type(result).__name__)
    if "sector" not in result.columns:
        raise CheckFailed("with_sectors should add a column called sector.", actual=str(list(result.columns)))
    if len(result) != len(table):
        raise CheckFailed("Everyone in the census should appear exactly once.", expected=f"{len(table)} rows", actual=f"{len(result)} rows")
    if result["name"].tolist() != table["name"].tolist():
        raise CheckFailed("Keep the people in the census's own order.")
    found = dict(zip(result["occupation"], result["sector"]))
    for occupation, sector in [("fisherman", "sea"), ("baker", "trade"), ("school", "children"), ("pharmacist", "unlisted")]:
        if found.get(occupation) != sector:
            raise CheckFailed(f"A {occupation} should be in the sector {sector!r}.", expected=sector, actual=repr(found.get(occupation)))


def sectors(ctx):
    grid(ctx.module().sector_table(census(ctx), trades(ctx)),
         ["at home", "children", "land", "sea", "service", "trade", "unlisted"], [1921, 1951, 1981, 2011],
         [[15, 15, 7, 2], [37, 44, 11, 20], [5, 5, 3, 9], [17, 16, 16, 11], [4, 9, 15, 9], [12, 9, 11, 12], [0, 0, 0, 5]],
         "sector_table(census, trades)")


def smaller(ctx):
    module = ctx.module()
    table = load(SMALL)
    cards = load(SMALL_TRADES)
    grid(module.parish_table(table), ["Harbour", "Hill", "Marsh"], [1901, 1911], [[3, 2], [0, 3], [2, 0]],
         "parish_table on a smaller census")
    people = module.with_sectors(table, cards)
    if len(people) != len(table):
        raise CheckFailed("with_sectors on a smaller census should keep everyone exactly once. This index has the cooper's card in twice.",
                          expected=f"{len(table)} rows", actual=f"{len(people)} rows")
    expected = ["sea", "sea", "sea", "trade", "trade", "sea", "unlisted", "trade", "at home", "at home"]
    if people["sector"].tolist() != expected:
        raise CheckFailed("with_sectors on a smaller census gives the wrong sectors.", expected=str(expected), actual=str(people["sector"].tolist()))
    grid(module.sector_table(table, cards), ["at home", "sea", "trade", "unlisted"], [1901, 1911], [[0, 2], [3, 1], [2, 1], [0, 1]],
         "sector_table on a smaller census")


def households_repeat(ctx):
    result = ctx.module().year_summary(load(SMALL))
    if [int(v) for v in result["households"]] != [3, 2]:
        raise CheckFailed("In the smaller census, 1901 has households 1, 2 and 3, and 1911 has 1 and 2.",
                          expected="[3, 2]", actual=str(result["households"].tolist()))


def left_alone(ctx):
    table = census(ctx)
    cards = trades(ctx)
    before, cards_before = table.copy(), cards.copy()
    module = ctx.module()
    module.parish_table(table)
    module.year_summary(table)
    module.with_sectors(table, cards)
    module.sector_table(table, cards)
    if not table.equals(before):
        raise CheckFailed("One of the functions changed the census it was given. Work on what merge and groupby give back.")
    if not cards.equals(cards_before):
        raise CheckFailed("One of the functions changed the trades index it was given. drop_duplicates gives back a new table: keep that instead.")


TESTS = [
    custom("People by parish and year", parishes, visible=True),
    custom("A summary of each census", summary, visible=True),
    custom("Everyone gets a sector", sectors_column,
           hint="A plain merge keeps only the rows that match. how=\"left\" keeps everyone, with NaN for a sector the index hasn't got."),
    custom("People by sector and year", sectors,
           hint="Mr Ashby's father filed the net maker card twice. A card that's in twice makes merge repeat every net maker."),
    custom("Households are counted within each year", households_repeat,
           hint="Household numbers start again at 1 in every census. Count the different numbers within each year."),
    custom("A smaller census, and an index with a card in twice", smaller,
           hint="Use the tables you're given. A parish with nobody in it one year should show 0, not NaN: fill_value=0."),
    custom("The census and the index are left as they were", left_alone),
]
