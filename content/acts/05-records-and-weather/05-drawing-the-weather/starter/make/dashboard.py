"""Weather History Dashboard: a century at a real weather station, on one page."""
import matplotlib.pyplot as plt
import pandas as pd

STATION_FILE = "stornoway.csv"
STATION = "Stornoway"


def load_station(path):
    """One row a month, dated, with the mean temperature worked out from the day and night."""
    station = pd.read_csv(path, parse_dates=["month"], index_col="month")
    station["temp"] = (station["tmax"] + station["tmin"]) / 2
    return station


def yearly(station):
    """One row a year: the mean temperature, the total rain and the total sunshine.

    A year with a month missing gets NaN for that reading, not a total of eleven months.
    """


def warming_chart(ax, temps):
    """Each year's temperature as a difference from the century's average, with a ten-year average."""


def rain_bars(ax, totals):
    """Each year's rain as a bar, on a scale that starts at zero."""
    # Check the scale is honest


def rain_histogram(ax, rain):
    """How many months had each amount of rain, in steps of 20 mm from 0 to 300."""


def july_scatter(ax, station):
    """One dot for each July with a sunshine record: its sunshine against its temperature."""


def dashboard(station):
    """All four charts on one figure, two by two, with a title for the whole page."""
    # Make the figure and its axes
    # Draw the data
    # Name everything, with units, and the source
    # Hand the figure back


if __name__ == "__main__":
    station = load_station(STATION_FILE)
    years = yearly(station)
    temps, rain = years["temp"], years["rain"]
    print(f"{STATION}, {years.index.min()} to {years.index.max()}: {len(station)} months")
    print(f"Warmest year: {temps.idxmax()} ({temps.max():.2f} degrees C). Coldest: {temps.idxmin()} ({temps.min():.2f} degrees C)")
    print(f"Wettest year: {rain.idxmax()} ({rain.max():.0f} mm). Driest: {rain.idxmin()} ({rain.min():.0f} mm)")
    change = temps.loc[1995:2024].mean() - temps.loc[1925:1954].mean()
    print(f"Last thirty years against the first thirty: {change:+.2f} degrees C")
    gaps = {name: [str(year) for year in years.index[years[name].isna()]] for name in ["temp", "sun"]}
    print(f"Left out for a missing month: temperature {', '.join(gaps['temp'])}; sunshine {', '.join(gaps['sun'])}")
    fig = dashboard(station)
    fig.savefig("dashboard.png")
    print("Saved dashboard.png")
    plt.show()
