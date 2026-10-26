"""The report's numbers, worked out from the cleaned station book. No charts, no printing.
None of these changes the table it's given.

yearly(station)            one row per year, labelled by the year, with the columns
                           temp (the mean of the twelve months), rain and sun (the
                           year's totals). A year with any month of a reading
                           missing gets NaN for that reading: half a year's
                           sunshine is not a year's sunshine.

decades(years)             the mean of each column of yearly(), one row per
                           decade, labelled by the decade's first year: 1920, 1930...
                           Missing years are left out of the means.

normals(station, first, last)
                           each month's average temp, rain and sun over the years
                           first to last, both included: 12 rows, labelled 1 to 12.

trend(years, column)       the slope of the best straight line through one column
                           of yearly() against the year, in units per decade.
                           np.polyfit(x, y, 1)[0] is the slope per year. Years with
                           NaN are left out.

compare(years, column, early, late, shuffles=5000, seed=0)
                           early and late are (first, last) pairs of years, both
                           included. Returns (difference, p): the late years' mean
                           minus the early years' mean, and p, the share of the
                           shuffles whose difference is at least as far from 0,
                           either way. Years with NaN are left out. Shuffle with
                           np.random.default_rng(seed), so it's the same every run.
"""
import numpy as np

from station import load_station
