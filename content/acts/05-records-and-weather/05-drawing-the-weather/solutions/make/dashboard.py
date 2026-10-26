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
    by_year = station.resample("YS")
    years = pd.DataFrame({
        "temp": by_year["temp"].mean().where(by_year["temp"].count() == 12),
        "rain": by_year["rain"].sum(min_count=12),
        "sun": by_year["sun"].sum(min_count=12),
    })
    years.index = years.index.year
    return years


def warming_chart(ax, temps):
    """Each year's temperature as a difference from the century's average, with a ten-year average."""
    difference = temps - temps.mean()
    ax.plot(difference.index, difference, label="each year")
    ax.plot(difference.index, difference.rolling(10).mean(), label="ten-year average")
    ax.axhline(0, color="grey", label="century average")
    ax.set_xlabel("year")
    ax.set_ylabel("difference from average (degrees C)")
    ax.set_title("Temperature, by year")
    ax.legend()


def rain_bars(ax, totals):
    """Each year's rain as a bar, on a scale that starts at zero."""
    ax.bar(totals.index, totals)
    # Check the scale is honest
    ax.set_ylim(bottom=0)
    ax.set_xlabel("year")
    ax.set_ylabel("rain (mm)")
    ax.set_title("Rain, by year")


def rain_histogram(ax, rain):
    """How many months had each amount of rain, in steps of 20 mm from 0 to 300."""
    ax.hist(rain, bins=range(0, 320, 20))
    ax.set_xlabel("rain in the month (mm)")
    ax.set_ylabel("months")
    ax.set_title("A century of months")


def july_scatter(ax, station):
    """One dot for each July with a sunshine record: its sunshine against its temperature."""
    julys = station[station.index.month == 7].dropna(subset=["sun"])
    ax.scatter(julys["sun"], julys["temp"])
    ax.set_xlabel("sunshine (hours)")
    ax.set_ylabel("temperature (degrees C)")
    ax.set_title("Julys")


def dashboard(station):
    """All four charts on one figure, two by two, with a title for the whole page."""
    # Make the figure and its axes
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    # Draw the data
    years = yearly(station)
    warming_chart(axes[0, 0], years["temp"])
    rain_bars(axes[0, 1], years["rain"])
    rain_histogram(axes[1, 0], station["rain"])
    july_scatter(axes[1, 1], station)
    # Name everything, with units, and the source
    first, last = station.index.year.min(), station.index.year.max()
    fig.suptitle(f"{STATION}, {first} to {last}. Data: Met Office historic station data")
    fig.tight_layout()
    # Hand the figure back
    return fig


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
