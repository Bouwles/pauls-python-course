# Households in the census, for the council's housing committee. By Pip.
import pandas as pd


def household_sizes(census):
    """How many people lived in each household: one number per household."""
    return census.groupby("household").size()


def average_household(census):
    """The average number of people in a household, over all four censuses."""
    return household_sizes(census).mean()


def largest_household(census):
    """The most people who lived in one household."""
    return household_sizes(census).max()


if __name__ == "__main__":
    census = pd.read_csv("census.csv")
    print(f"Households: {len(household_sizes(census))}")
    print(f"Average household: {average_household(census):.1f} people")
    print(f"Largest household: {largest_household(census)} people")
