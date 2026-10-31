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


def load_station(path):
    """The station's monthly table, with the file's marks kept as columns."""
    # Find the line that starts with yyyy

    # Read the table as text, one row per month

    # Note the marks before taking them off

    # Turn the text into numbers, with honest names

    # Label the rows 0, 1, 2 and so on


def annual_rain(station):
    """Each year's rain, NaN unless all twelve months were measured."""
