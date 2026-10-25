"""The report's charts. Each makes its own figure and returns (fig, ax), or
(fig, axes) for two panels side by side. No printing.

Priya's rules, for every chart:
- every axis says what it measures, and in what units
- a title that says what the chart shows
- a key wherever there's more than one line
- bars, and anything that's an amount, on a scale that starts at zero
- the source in small print along the bottom: fig.text(0.01, 0.01, SOURCE, fontsize=8)

temperature_chart(years, normal)
    years is yearly(); normal is a number, the 1961 to 1990 average temperature.
    Three lines: each year's temperature minus normal ("each year"), its ten-year
    rolling average ("ten-year average"), and a line right across at 0
    ("1961 to 1990 average"). Axes: year, and difference from the 1961 to 1990
    average (degrees C).

rain_chart(tens)
    tens is decades(): one bar per decade, its average year's rain. Axes: decade,
    and rain in an average year (mm).

months_chart(then, now)
    then and now are two normals() tables: 1961 to 1990, and 1995 to 2024. Two
    panels side by side. Left: each month's temperature, one line for each table.
    Right: each month's rain, one line for each table. Lines labelled
    "1961 to 1990" and "1995 to 2024". Axes: month, and temperature (degrees C)
    on the left, rain (mm) on the right.
"""
import matplotlib.pyplot as plt

SOURCE = "Source: Saltmarsh Weather Station book, 1925 to 2024, at the Records Office"


def temperature_chart(years, normal):
    """Each year's difference from the 1961 to 1990 average, with a ten-year average."""
    difference = years["temp"] - normal
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.plot(difference.index, difference, label="each year")
    ax.plot(difference.index, difference.rolling(10).mean(), label="ten-year average")
    ax.axhline(0, color="grey", label="1961 to 1990 average")
    ax.set_xlabel("year")
    ax.set_ylabel("difference from the 1961 to 1990 average (degrees C)")
    ax.set_title("Saltmarsh temperature, year by year")
    ax.legend()
    fig.text(0.01, 0.01, SOURCE, fontsize=8)
    return fig, ax


def rain_chart(tens):
    """One bar per decade: the rain in its average year, from zero."""
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.bar(tens.index, tens["rain"], width=8)
    ax.set_ylim(bottom=0)
    ax.set_xlabel("decade")
    ax.set_ylabel("rain in an average year (mm)")
    ax.set_title("Saltmarsh rain, decade by decade (the 1920s and 2020s are five years each)")
    fig.text(0.01, 0.01, SOURCE, fontsize=8)
    return fig, ax


def months_chart(then, now):
    """Each month's temperature and rain, 1961 to 1990 against 1995 to 2024."""
    fig, (temps, rain) = plt.subplots(1, 2, figsize=(11, 4))
    for table, label in [(then, "1961 to 1990"), (now, "1995 to 2024")]:
        temps.plot(table.index, table["temp"], marker="o", label=label)
        rain.plot(table.index, table["rain"], marker="o", label=label)
    temps.set_xlabel("month")
    temps.set_ylabel("temperature (degrees C)")
    temps.set_title("Temperature by month")
    rain.set_xlabel("month")
    rain.set_ylabel("rain (mm)")
    rain.set_title("Rain by month")
    rain.set_ylim(bottom=0)
    temps.legend()
    rain.legend()
    fig.text(0.01, 0.01, SOURCE, fontsize=8)
    return fig, (temps, rain)
