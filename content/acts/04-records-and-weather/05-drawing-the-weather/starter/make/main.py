# Charts for the Weather Station noticeboard, drawn from the station book.
import matplotlib.pyplot as plt
import pandas as pd


def rain_bars(totals):
    """Each year's rain as a bar, on a scale that starts at zero."""
    # Make the figure and its axes

    # Draw the data

    # Name everything, with units

    # Check the scale is honest

    # Hand the figure back


def warming_chart(temps):
    """How far each year was from the century's average, with a ten-year average."""


def rain_histogram(rain):
    """How many months had each amount of rain, in steps of 20 mm from 0 to 300."""


def july_scatter(station):
    """One dot for each July with a sunshine record: its sunshine against its temperature."""


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
