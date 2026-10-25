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


def yearly(station):
    """One row per year: the mean temp, and the rain and sun totals, NaN where a month is missing."""
    by_year = station.groupby("year")
    return by_year.agg(
        temp=("temp", lambda temps: temps.mean() if temps.count() == 12 else np.nan),
        rain=("rain", lambda rain: rain.sum(min_count=12)),
        sun=("sun", lambda sun: sun.sum(min_count=12)),
    )


def decades(years):
    """The mean of each column, one row per decade, labelled 1920, 1930..."""
    return years.groupby(years.index // 10 * 10).mean()


def normals(station, first, last):
    """Each month's average temp, rain and sun over the years first to last."""
    period = station[(station["year"] >= first) & (station["year"] <= last)]
    return period.groupby("month")[["temp", "rain", "sun"]].mean()


def trend(years, column):
    """The slope of the best straight line through one column, per decade."""
    known = years[column].dropna()
    return np.polyfit(known.index, known.to_numpy(), 1)[0] * 10


def compare(years, column, early, late, shuffles=5000, seed=0):
    """(late mean minus early mean, the share of shuffles at least that far from 0)."""
    values = years[column]
    first = values.loc[early[0]:early[1]].dropna().to_numpy()
    second = values.loc[late[0]:late[1]].dropna().to_numpy()
    difference = second.mean() - first.mean()

    rng = np.random.default_rng(seed)
    both = np.concatenate([first, second])
    as_far = 0
    for _ in range(shuffles):
        shuffled = rng.permutation(both)
        shuffled_difference = shuffled[len(first):].mean() - shuffled[:len(first)].mean()
        if abs(shuffled_difference) >= abs(difference):
            as_far += 1
    return difference, as_far / shuffles


if __name__ == "__main__":
    years = yearly(load_station("ledger.csv"))
    print(decades(years).round(2))
    print(f"Warming: {trend(years, 'temp'):.2f} degrees C a decade")
    print(compare(years, "temp", (1925, 1954), (1995, 2024)))
