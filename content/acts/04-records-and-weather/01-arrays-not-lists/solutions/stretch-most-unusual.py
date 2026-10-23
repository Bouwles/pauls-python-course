import numpy as np


def monthly_means(rain):
    return rain.mean(axis=0)


def anomalies(rain):
    return rain - monthly_means(rain)


def most_unusual(years, rain):
    """The year and month number (1 to 12) of the month furthest from its normal."""
    distance = np.abs(anomalies(rain))
    row, column = np.unravel_index(distance.argmax(), rain.shape)
    return int(years[row]), int(column) + 1
