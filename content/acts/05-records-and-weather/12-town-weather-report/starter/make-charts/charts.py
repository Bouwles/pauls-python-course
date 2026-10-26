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

SOURCE = "Source: {{town}} Weather Station book, 1925 to 2024, at the Records Office"
