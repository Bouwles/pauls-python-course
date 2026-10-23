import numpy as np

data = np.loadtxt("rainfall.csv", delimiter=",", skiprows=1)
rain = data[:, 1:]


def yearly_totals(rain):
    """Each year's total: one number per year."""
    return rain.sum(axis=1)


def monthly_means(rain):
    """Each month's average over the century: one number per month."""
    return rain.mean(axis=0)


print("Yearly totals:", yearly_totals(rain).shape)
print("Monthly means:", monthly_means(rain).shape)
