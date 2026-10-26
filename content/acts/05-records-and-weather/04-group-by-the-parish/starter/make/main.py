# The census, by parish and by trade, for Mr Ashby and the council.
# Typed up from the enumerators' books by A. Penhallow, 1983.
# Hill, 1981: one engineer, household of one. The enumerator asked
# whether anyone else lived with me. I said not yet. A.P.
import pandas as pd


def parish_table(census):
    """People in each parish in each census year: parishes down the side, years across."""


def year_summary(census):
    """One row per census year: people, households, average age and people per household."""


def with_sectors(census, trades):
    """The census with each person's sector from the trades index. Everyone kept, once, in order."""


def sector_table(census, trades):
    """People in each sector in each census year: sectors down the side, years across."""


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
