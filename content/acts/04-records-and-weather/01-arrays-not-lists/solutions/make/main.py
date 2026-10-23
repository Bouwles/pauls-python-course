# Rainfall at the harbour gauge, for Mr Ashby and the Weather Station.
import numpy as np


def load_rainfall(path):
    """Read the rainfall file. Returns (years, rain): 100 years, and 100 rows of 12 months."""
    # Typed in from Mr Ashby's ledgers: 1,200 months of rain. The machine on
    # the hill read the lot in under a second, then sat there waiting for more.
    # There is no more. That is the trouble with the past. A.P.
    data = np.loadtxt(path, delimiter=",", skiprows=1)
    years = data[:, 0].astype(int)
    rain = data[:, 1:]
    return years, rain


def yearly_totals(rain):
    """Each year's total: one number per year."""
    # axis=1 collapses the columns, so each row (a year) becomes one number.
    return rain.sum(axis=1)


def monthly_means(rain):
    """Each month's average over all the years: one number per month."""
    return rain.mean(axis=0)


def anomalies(rain):
    """How far each month was from that month's average. Same shape as rain."""
    # (100, 12) minus (12,): the twelve averages are broadcast down every year.
    # A new array comes back; rain itself is left alone.
    return rain - monthly_means(rain)


def wettest_year(years, rain):
    """The year with the biggest total."""
    return int(years[yearly_totals(rain).argmax()])


def count_unusual(rain, limit):
    """How many months were more than limit mm from their month's average, either way."""
    unusual = np.abs(anomalies(rain)) > limit
    return int(unusual.sum())


if __name__ == "__main__":
    years, rain = load_rainfall("rainfall.csv")
    totals = yearly_totals(rain)
    print(f"{len(years)} years, {rain.size} months")
    print(f"Wettest year: {wettest_year(years, rain)} ({totals.max():.1f} mm)")
    print("Average by month:", monthly_means(rain).round().astype(int))
    print(f"Months more than 60 mm from normal: {count_unusual(rain, 60)}")
