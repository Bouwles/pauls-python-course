# The census tables, for Mr Ashby and the council.
import pandas as pd


def census_year(census, year):
    """Every row from one census year."""


def parish_count(census, year, parish):
    """How many people lived in one parish in one census year."""


def trade(census, year, occupation):
    """Name, parish and age of everyone in one occupation in one year, oldest first."""


def oldest(census, year):
    """The name of the oldest person in one census year."""


def parish_sizes(census, year):
    """How many people lived in each parish in one year, largest first."""


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
