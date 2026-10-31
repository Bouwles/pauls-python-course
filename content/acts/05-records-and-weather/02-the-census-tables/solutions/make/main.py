# The census tables, from the Archive's cabinets.
import pandas as pd


def census_year(census, year):
    """Every row from one census year."""
    return census[census["year"] == year]


def parish_count(census, year, parish):
    """How many people lived in one parish in one census year."""
    # & for row-by-row "and", with brackets round each condition.
    rows = census[(census["year"] == year) & (census["parish"] == parish)]
    return len(rows)


def trade(census, year, occupation):
    """Name, parish and age of everyone in one occupation in one year, oldest first."""
    rows = census[(census["year"] == year) & (census["occupation"] == occupation)]
    return rows[["name", "parish", "age"]].sort_values("age", ascending=False)


def oldest(census, year):
    """The name of the oldest person in one census year."""
    people = census_year(census, year).sort_values("age", ascending=False)
    # iloc, not loc: after sorting, the first row's label could be anything.
    return people["name"].iloc[0]


def parish_sizes(census, year):
    """How many people lived in each parish in one year, largest first."""
    return census_year(census, year)["parish"].value_counts()


if __name__ == "__main__":
    census = pd.read_csv("census.csv")
    year = 1951
    print(f"Census of {year}: {len(census_year(census, year))} people")
    sizes = parish_sizes(census, year)
    print("By parish:", ", ".join(f"{parish} {count}" for parish, count in sizes.items()))
    print(f"On the Hill: {parish_count(census, year, 'Hill')}")
    fishermen = trade(census, year, "fisherman")
    print(f"Fishermen: {len(fishermen)}")
    print(f"Oldest of all: {oldest(census, year)}")
