# The river rescue crew register, through a cleaning pipeline: one step at a time, each written down.
import numpy as np
import pandas as pd

# The three ways the volunteers wrote a date: 1960-01-09, 09/01/1960, 9 Jan 1960.
DATE_FORMATS = ["%Y-%m-%d", "%d/%m/%Y", "%d %b %Y"]


def parse_dates(column):
    """Read a column of text dates written in any of DATE_FORMATS. Unreadable ones become NaT."""
    # Read the dates, one format at a time
    dates = pd.to_datetime(column, format=DATE_FORMATS[0], errors="coerce")
    for date_format in DATE_FORMATS[1:]:
        # Fill only the gaps the earlier formats couldn't read.
        dates = dates.fillna(pd.to_datetime(column, format=date_format, errors="coerce"))
    return dates


def tidy_text(register):
    """Names and parishes with no spaces at the ends, in title case."""
    # Work on a copy
    clean = register.copy()
    # Tidy the text
    clean["name"] = clean["name"].str.strip().str.title()
    clean["parish"] = clean["parish"].str.strip().str.title()
    return clean


def read_dates(register):
    """The joined column as real dates, read one format at a time."""
    clean = register.copy()
    clean["joined"] = parse_dates(clean["joined"])
    return clean


def make_numbers(register):
    """Ages as numbers, missing where they can't be read; launches as whole numbers."""
    clean = register.copy()
    # Make the numbers numbers
    clean["age"] = pd.to_numeric(clean["age"], errors="coerce")
    clean["launches"] = pd.to_numeric(clean["launches"].replace("none", "0"))
    return clean


def drop_impossible(register):
    """Ages over 100 made missing: nobody joined the crew at 412."""
    clean = register.copy()
    # Throw out the impossible
    clean.loc[clean["age"] > 100, "age"] = np.nan
    return clean


def drop_duplicates(register):
    """Each row once, labelled 0, 1, 2 and so on again."""
    # Drop the duplicates, last
    return register.drop_duplicates().reset_index(drop=True)


# Paul's steps, in his order. Duplicates last, once the copies look alike.
PIPELINE = [tidy_text, read_dates, make_numbers, drop_impossible, drop_duplicates]


def clean_register(raw):
    """Run the register through every step of the pipeline, in order. raw is left as it was."""
    register = raw
    for step in PIPELINE:
        register = step(register)
    return register


def joined_in(crew, year):
    """Names of everyone who joined in one year, earliest first."""
    rows = crew[crew["joined"].dt.year == year].sort_values("joined")
    return rows["name"].tolist()


if __name__ == "__main__":
    raw = pd.read_csv("register.csv")
    print(f"Read register.csv: {len(raw)} rows, {raw.isna().sum().sum()} values missing")
    register = raw
    for step in PIPELINE:
        register = step(register)
        print(f"  {step.__name__:<16} {len(register)} rows, {register.isna().sum().sum()} values missing")
    register.to_csv("register_clean.csv", index=False)
    print("Saved register_clean.csv")
    print()
    print(f"Crew on the register: {len(register)}")
    print(f"Joined from {register['joined'].min().year} to {register['joined'].max().year}")
    known = register["age"].notna().sum()
    print(f"Ages known for {known}; average age on joining: {register['age'].mean():.1f}")
    busiest = register.loc[register["launches"].idxmax()]
    print(f"Most launches: {busiest['name']}, {busiest['launches']}")
    print(f"Joined in 1987: {', '.join(joined_in(register, 1987))}")
