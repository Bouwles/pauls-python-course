# The lifeboat crew register, cleaned once and properly.
import numpy as np
import pandas as pd

# The three ways the volunteers wrote a date: 1960-01-09, 09/01/1960, 9 Jan 1960.
DATE_FORMATS = ["%Y-%m-%d", "%d/%m/%Y", "%d %b %Y"]


def parse_dates(column):
    """Read a column of text dates written in any of DATE_FORMATS. Unreadable ones become NaT."""
    dates = pd.to_datetime(column, format=DATE_FORMATS[0], errors="coerce")
    for date_format in DATE_FORMATS[1:]:
        # Fill only the gaps the earlier formats couldn't read.
        dates = dates.fillna(pd.to_datetime(column, format=date_format, errors="coerce"))
    return dates


def clean_register(raw):
    """A tidy copy of the register. The raw table is left exactly as it was."""
    # Work on a copy
    clean = raw.copy()

    # Tidy the text
    clean["name"] = clean["name"].str.strip().str.title()
    clean["parish"] = clean["parish"].str.strip().str.title()

    # Read the dates, one format at a time
    clean["joined"] = parse_dates(clean["joined"])

    # Make the numbers numbers
    clean["age"] = pd.to_numeric(clean["age"], errors="coerce")
    clean["launches"] = pd.to_numeric(clean["launches"].replace("none", "0"))

    # Throw out the impossible: nobody joined the lifeboat at 412
    clean.loc[clean["age"] > 100, "age"] = np.nan

    # Drop the duplicates, last, once the copies look alike
    return clean.drop_duplicates().reset_index(drop=True)


if __name__ == "__main__":
    raw = pd.read_csv("register.csv")
    crew = clean_register(raw)
    print(f"Crew on the register: {len(crew)}")
    print(f"Joined from {crew['joined'].min().year} to {crew['joined'].max().year}")
    known = crew["age"].notna().sum()
    print(f"Ages known for {known}; average age on joining: {crew['age'].mean():.1f}")
    busiest = crew.loc[crew["launches"].idxmax()]
    print(f"Most launches: {busiest['name']}, {busiest['launches']}")
