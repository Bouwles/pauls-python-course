"""Your investigation of the Stornoway record. Press Run to run this file.

station.py loads and cleans; test_station.py checks the cleaning; this file
asks the question and draws the answer.
"""
import matplotlib.pyplot as plt
import pytest

from station import annual_rain, load_station

if __name__ == "__main__":
    # Your own tests first, run by pytest just as they would be at home
    pytest.main(["-q", "--capture=sys", "-p", "no:cacheprovider", "test_station.py"])

    station = load_station("stornowaydata.txt")
    print(f"{len(station)} months, from {station['year'].min()} to {station['year'].max()}")

    # The question, in one sentence:
    # Is Stornoway warmer now than a century ago, and by how much?

    # The years to compare, chosen before looking:
    # the standard thirty-year periods 1891 to 1920 and 1991 to 2020.
    checked = station[~station["provisional"]].copy()
    checked["tmean"] = (checked["tmax"] + checked["tmin"]) / 2
    complete = checked.groupby("year")["tmean"].count() == 12
    yearly = checked.groupby("year")["tmean"].mean()[complete]

    # The analysis
    then = yearly.loc[1891:1920]
    now = yearly.loc[1991:2020]
    print(f"1891 to 1920: {then.mean():.2f} C over {len(then)} years, spread {then.std():.2f}")
    print(f"1991 to 2020: {now.mean():.2f} C over {len(now)} years, spread {now.std():.2f}")
    print(f"Warmer by {now.mean() - then.mean():.2f} C")
    print(f"Years with all twelve months of rain: {annual_rain(station).notna().sum()}")

    # The charts: every axis labelled, with units
    plt.plot(yearly.index, yearly, color="0.7", label="each year")
    plt.plot(yearly.index, yearly.rolling(10, center=True).mean(), color="C0", label="ten-year average")
    for period in (then, now):
        plt.hlines(period.mean(), period.index[0], period.index[-1], color="C3")
    plt.xlabel("year")
    plt.ylabel("mean temperature (C), axis not from zero")
    plt.title("Stornoway: nearly a degree warmer than a century ago")
    plt.legend()
    plt.show()
