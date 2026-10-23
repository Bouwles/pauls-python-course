# The lifeboat crew register, cleaned once and properly.
import numpy as np
import pandas as pd

# The three ways the volunteers wrote a date: 1960-01-09, 09/01/1960, 9 Jan 1960.
DATE_FORMATS = ["%Y-%m-%d", "%d/%m/%Y", "%d %b %Y"]


def parse_dates(column):
    """Read a column of text dates written in any of DATE_FORMATS. Unreadable ones become NaT."""


def clean_register(raw):
    """A tidy copy of the register. The raw table is left exactly as it was."""
    # Work on a copy

    # Tidy the text

    # Read the dates, one format at a time

    # Make the numbers numbers

    # Throw out the impossible

    # Drop the duplicates, last


if __name__ == "__main__":
    raw = pd.read_csv("register.csv")
    crew = clean_register(raw)
    print(f"Crew on the register: {len(crew)}")
    print(f"Joined from {crew['joined'].min().year} to {crew['joined'].max().year}")
    known = crew["age"].notna().sum()
    print(f"Ages known for {known}; average age on joining: {crew['age'].mean():.1f}")
    busiest = crew.loc[crew["launches"].idxmax()]
    print(f"Most launches: {busiest['name']}, {busiest['launches']}")
