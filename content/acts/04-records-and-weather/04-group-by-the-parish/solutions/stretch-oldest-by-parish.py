import pandas as pd


def oldest_by_parish(census, year):
    """The name of the oldest person in each parish in one census year."""
    rows = census[census["year"] == year]
    oldest_rows = rows.groupby("parish")["age"].idxmax()
    names = rows.loc[oldest_rows, "name"]
    names.index = oldest_rows.index
    return names
