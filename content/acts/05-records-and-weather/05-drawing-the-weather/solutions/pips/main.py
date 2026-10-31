# Two charts for the Archive wall. By Caitlin. Made them dramatic, so people look.
import matplotlib.pyplot as plt
import pandas as pd

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def decade_bars(decades, temps):
    """Each decade's average temperature, as a bar."""
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.bar(decades, temps)
    ax.set_ylim(bottom=0)  # a bar's length is its value
    ax.set_xlabel("decade")
    ax.set_ylabel("average temperature (degrees C)")
    ax.set_title("Stornoway is getting warmer")
    return fig, ax


def rain_panels(driest, wettest):
    """Each month's rain in the driest year of the century, and in the wettest, side by side."""
    # One scale for both, so the same height means the same rain.
    fig, axes = plt.subplots(1, 2, figsize=(10, 3), sharey=True)
    axes[0].bar(MONTHS, driest)
    axes[1].bar(MONTHS, wettest)
    axes[0].set_title("1968, the driest year")
    axes[1].set_title("1999, the wettest year")
    axes[0].set_ylabel("rain (mm)")
    return fig, axes


if __name__ == "__main__":
    station = pd.read_csv("stornoway.csv", parse_dates=["month"], index_col="month")
    station["temp"] = (station["tmax"] + station["tmin"]) / 2
    yearly = station["temp"].resample("YS").mean()
    by_decade = yearly.groupby(yearly.index.year // 10 * 10).mean()
    decade_bars([f"{decade}s" for decade in by_decade.index], by_decade)
    driest = station.loc["1968", "rain"]
    wettest = station.loc["1999", "rain"]
    rain_panels(driest, wettest)
    plt.show()
