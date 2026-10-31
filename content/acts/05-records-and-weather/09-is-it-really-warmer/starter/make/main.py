# Is it really warmer? The Clocktower station's answer, for Yahya's bet with Paul.
import numpy as np
import pandas as pd


def difference(before, after):
    """How much bigger the average is after than before."""
    # Measure the real difference


def shuffled_differences(before, after, rng, shuffles=10_000):
    """The difference between the groups' averages, after shuffling the labels, many times."""
    # Pool the readings, as if the label didn't matter

    # Shuffle and deal them out again, many times


def p_value(before, after, rng, shuffles=10_000):
    """How often shuffling gives a difference at least as big as the real one."""
    # Count how often chance does as well

    # The share is the p-value


def correlation(x, y):
    """How closely x and y rise and fall together along a straight line, from -1 to 1."""


if __name__ == "__main__":
    station = pd.read_csv("station.csv")
    temps = station.groupby("year")["temp"].mean()
    rain = station.groupby("year")["rain"].sum()
    early, late = temps.loc[1925:1954], temps.loc[1995:2024]
    rng = np.random.default_rng(2024)

    print(f"First thirty years: {early.mean():.2f} degrees C. Last thirty: {late.mean():.2f}.")
    warmer = p_value(early, late, rng)
    print(f"Warmer by {difference(early, late):.2f} degrees C. "
          f"Shuffled 10,000 times, chance did as well {warmer * 10_000:,.0f} times.")
    # Drier means the early years had more rain, so they go second.
    wet_early, wet_late = rain.loc[1925:1954], rain.loc[1995:2024]
    drier = p_value(wet_late, wet_early, rng)
    print(f"Drier by {difference(wet_late, wet_early):.0f} mm a year. "
          f"Shuffled 10,000 times, chance did as well {drier * 10_000:,.0f} times.")

    years = temps.index.to_numpy()
    print(f"Year and temperature: r = {correlation(years, temps):.2f}")
    print(f"The Clocktower's age and temperature: r = {correlation(years - 1890, temps):.2f}")
