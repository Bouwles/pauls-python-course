"""Met Office historic station data, read once and properly.

clean_column(texts)
        a Series of text such as "8.4", "3.2*", "---" and "47.1#" as floats:
        the marks are dropped and "---" becomes NaN
load_station(path)
        the station file as a DataFrame, one row per month, in file order,
        labelled 0, 1, 2 and so on, with these columns in this order:
            year, month                          whole numbers
            tmax, tmin, frost_days, rain, sun    floats, NaN where missing
            estimated      True if any value in the row is marked *
            sun_sensor     True if the sunshine is marked #
            provisional    True on rows marked Provisional
        The files don't all have the same number of lines before the table:
        find the line that starts with yyyy rather than counting.
annual_rain(station)
        total rain for each year, as a Series indexed by year, NaN for any
        year without all twelve months of rain
"""

import numpy as np
import pandas as pd

MEASURES = ["tmax", "tmin", "frost_days", "rain", "sun"]
COLUMNS = ["year", "month"] + MEASURES + ["estimated", "sun_sensor", "provisional"]


def clean_column(texts):
    """Text values with their marks taken off, as floats; '---' is missing."""
    numbers = texts.str.strip().str.rstrip("*#").replace("---", np.nan)
    return pd.to_numeric(numbers).astype(float)


def load_station(path):
    """The station's monthly table, with the file's marks kept as columns."""
    with open(path) as station_file:
        lines = station_file.read().splitlines()
    header = next(i for i, line in enumerate(lines) if line.split()[:1] == ["yyyy"])

    rows = []
    for line in lines[header + 2:]:
        fields = line.split()
        if len(fields) >= 7 and fields[0].isdigit():
            rows.append(fields[:7] + [" ".join(fields[7:])])
    raw = pd.DataFrame(rows, columns=["year", "month"] + MEASURES + ["note"])

    station = pd.DataFrame({"year": raw["year"].astype(int), "month": raw["month"].astype(int)})
    for name in MEASURES:
        station[name] = clean_column(raw[name])
    station["estimated"] = raw[MEASURES].apply(lambda column: column.str.endswith("*")).any(axis=1)
    station["sun_sensor"] = raw["sun"].str.endswith("#")
    station["provisional"] = raw["note"].str.contains("Provisional")
    return station[COLUMNS].reset_index(drop=True)


def annual_rain(station):
    """Each year's rain, NaN unless all twelve months were measured."""
    return station.groupby("year")["rain"].sum(min_count=12)
