# The census tables, from the Archive's cabinets.
import pandas as pd


def census_year(census, year):
    """Every row from one census year."""
    # Keep the rows where the year matches


def parish_count(census, year, parish):
    """How many people lived in one parish in one census year."""
    # Add a second condition with &, brackets round each one
    # Count the rows that are left


def trade(census, year, occupation):
    """Name, parish and age of everyone in one occupation in one year, oldest first."""
    # Pick out the columns you need, then sort


def oldest(census, year):
    """The name of the oldest person in one census year."""
    # Take the first by position


def parish_sizes(census, year):
    """How many people lived in each parish in one year, largest first."""
    # Count each value with value_counts


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
