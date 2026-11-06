# The census, by parish and by trade, for the wall chart in the Archive.
import pandas as pd


def parish_table(census):
    """People in each parish in each census year: parishes down the side, years across."""
    # Count each group in a grid, 0 where there's nobody


def year_summary(census):
    """One row per census year: people, households, average age and people per household."""
    # Group, and name each summary with agg
    # Work out a new column from two summaries


def with_sectors(census, trades):
    """The census with each person's sector from the trades index. Everyone kept, once, in order."""
    # Keep one card per key
    # Merge with how="left" so nobody is dropped
    # Fill the gaps


def sector_table(census, trades):
    """People in each sector in each census year: sectors down the side, years across."""
    # Count each group in a grid, 0 where there's nobody


if __name__ == "__main__":
    census = pd.read_csv("census.csv")
    trades = pd.read_csv("trades.csv")
    print("People by parish")
    print(parish_table(census))
    print()
    print("By census")
    print(year_summary(census).round(1))
    print()
    print("By sector")
    print(sector_table(census, trades))
