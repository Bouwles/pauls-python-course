# The census, by parish and by trade, for Mr Ashby and the council.
# Typed up from the enumerators' books by A. Penhallow, 1983.
# Hill, 1981: one engineer, household of one. The enumerator asked
# whether anyone else lived with me. I said not yet. A.P.
import pandas as pd


def parish_table(census):
    """People in each parish in each census year: parishes down the side, years across."""
    return census.pivot_table(index="parish", columns="year", aggfunc="size", fill_value=0)


def year_summary(census):
    """One row per census year: people, households, average age and people per household."""
    summary = census.groupby("year").agg(
        people=("name", "size"),
        households=("household", "nunique"),
        average_age=("age", "mean"),
    )
    summary["per_household"] = summary["people"] / summary["households"]
    return summary


def with_sectors(census, trades):
    """The census with each person's sector from the trades index. Everyone kept, once, in order."""
    # One card per occupation, or the merge repeats everyone with that occupation.
    cards = trades.drop_duplicates("occupation")
    # A left merge keeps the people whose occupation the index never heard of.
    people = census.merge(cards, on="occupation", how="left", validate="many_to_one")
    people["sector"] = people["sector"].fillna("unlisted")
    return people


def sector_table(census, trades):
    """People in each sector in each census year: sectors down the side, years across."""
    people = with_sectors(census, trades)
    return people.pivot_table(index="sector", columns="year", aggfunc="size", fill_value=0)


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
