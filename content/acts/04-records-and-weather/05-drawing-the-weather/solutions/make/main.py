# Charts for the Weather Station noticeboard, drawn from the station book.
import matplotlib.pyplot as plt
import pandas as pd


def rain_bars(totals):
    """Each year's rain as a bar, on a scale that starts at zero."""
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.bar(totals.index, totals)
    ax.set_ylim(bottom=0)
    ax.set_xlabel("year")
    ax.set_ylabel("rain (mm)")
    ax.set_title("Rain at Saltmarsh, by year")
    return fig, ax


def warming_chart(temps):
    """How far each year was from the century's average, with a ten-year average."""
    difference = temps - temps.mean()
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.plot(difference.index, difference, label="each year")
    ax.plot(difference.index, difference.rolling(10).mean(), label="ten-year average")
    ax.axhline(0, color="grey", label="century average")
    ax.set_xlabel("year")
    ax.set_ylabel("difference from average (degrees C)")
    ax.set_title("Temperature at Saltmarsh, by year")
    ax.legend()
    return fig, ax


def rain_histogram(rain):
    """How many months had each amount of rain, in steps of 20 mm from 0 to 300."""
    fig, ax = plt.subplots()
    ax.hist(rain, bins=range(0, 320, 20))
    ax.set_xlabel("rain in the month (mm)")
    ax.set_ylabel("months")
    ax.set_title("A century of months at Saltmarsh")
    return fig, ax


def july_scatter(station):
    """One dot for each July with a sunshine record: its sunshine against its temperature."""
    julys = station[station["month"] == 7].dropna(subset=["sun"])
    fig, ax = plt.subplots()
    ax.scatter(julys["sun"], julys["temp"])
    ax.set_xlabel("sunshine (hours)")
    ax.set_ylabel("temperature (degrees C)")
    ax.set_title("Julys at Saltmarsh")
    return fig, ax


if __name__ == "__main__":
    station = pd.read_csv("station.csv")
    yearly_rain = station.groupby("year")["rain"].sum()
    yearly_temp = station.groupby("year")["temp"].mean()
    rain_bars(yearly_rain)
    warming_chart(yearly_temp)
    rain_histogram(station["rain"])
    july_scatter(station)
    print(f"Four charts, from {len(station)} months of readings.")
    plt.show()
