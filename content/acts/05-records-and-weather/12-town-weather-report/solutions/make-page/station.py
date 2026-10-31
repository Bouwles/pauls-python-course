"""Reading and cleaning the station book. No charts and no printing in here.

ledger.csv is the station book as it was typed: one row per month, with
  month   the year and month, like 1925-01 (one volunteer wrote 1933-4)
  temp    the month's average temperature, in the unit beside it
  unit    F or C, as written: the book was kept in Fahrenheit until 1960
  rain    the month's rain, in millimetres
  sun     the month's hours of sunshine; the recorder was away from 1941 to 1945

to_celsius(fahrenheit)    degrees C from degrees F, (F - 32) * 5 / 9. Works on a
                          single number or a whole column at once.

load_station(path)        the cleaned station book: a DataFrame with the columns
                          year, month, temp, rain, sun, in that order.
                          - year and month are whole numbers
                          - temp is in degrees C, whatever unit it was written in;
                            converted ones are rounded to one decimal place, as
                            the rest of the book was kept
                          - sun is a number, missing where nothing was measured
                          - each month appears once, in order, and the rows are
                            labelled 0, 1, 2 and so on
                          The file itself is never changed.

missing_months(station)   a list of the months, as text like "1941-03", that have
                          no row between the station book's first month and its
                          last. [] if there are none.
"""
# Fahrenheit until the end of 1960, Celsius after. The volunteers typed them
# as they were written and marked which was which. Read the numbers without
# the marks and the 1950s come out tropical.
import pandas as pd


def to_celsius(fahrenheit):
    """Degrees C from degrees F, for a number or a whole column."""
    return (fahrenheit - 32) * 5 / 9


def load_station(path):
    """The cleaned station book: year, month, temp (degrees C), rain, sun."""
    raw = pd.read_csv(path, dtype=str)

    # Split the month into whole-number years and months
    parts = raw["month"].str.strip().str.split("-", expand=True)
    station = pd.DataFrame({"year": parts[0].astype(int), "month": parts[1].astype(int)})

    # Make the numbers numbers: "away" means the recorder wasn't there
    temp = pd.to_numeric(raw["temp"])
    station["rain"] = pd.to_numeric(raw["rain"])
    station["sun"] = pd.to_numeric(raw["sun"], errors="coerce")

    # One unit for every temperature, to the book's one decimal place
    fahrenheit = raw["unit"].str.strip().str.upper() == "F"
    station["temp"] = temp.where(~fahrenheit, to_celsius(temp).round(1))

    # Drop the duplicates, last, then put the months in order
    station = station[["year", "month", "temp", "rain", "sun"]].drop_duplicates()
    return station.sort_values(["year", "month"]).reset_index(drop=True)


def missing_months(station):
    """Months between the first and the last that have no row, as text like "1941-03"."""
    present = set(zip(station["year"], station["month"]))
    first = (station["year"].iloc[0], station["month"].iloc[0])
    last = (station["year"].iloc[-1], station["month"].iloc[-1])
    gaps = []
    year, month = first
    while (year, month) <= last:
        if (year, month) not in present:
            gaps.append(f"{year}-{month:02d}")
        month += 1
        if month > 12:
            year, month = year + 1, 1
    return gaps


if __name__ == "__main__":
    station = load_station("ledger.csv")
    print(station.head())
    print(len(station), "months;", "missing:", missing_months(station) or "none")
