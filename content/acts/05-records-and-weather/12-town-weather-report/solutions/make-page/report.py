"""The Clocktower Weather Report, for Aaesha. Run it, and it prints the report,
draws its three charts, and writes the whole story as a web page, story.html.

It prints this, in this order, with every number worked out from ledger.csv
by your own functions, never typed in:

The Clocktower Weather Report, 1925 to 2024
Source: Clocktower weather station book, 1925 to 2024, in the Archive

The record
  1200 months, missing months: none
  Warmest year: 2022 (12.99 degrees C). Coldest: 1963 (9.84 degrees C)
  Wettest year: 1960 (1439 mm). Driest: 1982 (798 mm)

Then and now: 1995 to 2024 against 1925 to 1954
  Temperature: +0.86 degrees C (p < 0.001)
  Rain: -35 mm a year (p = 0.21)
  Sunshine: +26 hours a year (p = 0.43)
  Warming over the century: 0.13 degrees C a decade
  Warmed most on the 1961 to 1990 normal: June, +1.50 degrees C

Conclusion
  Your own paragraph, at least 50 words: what has changed, how sure you are,
  what hasn't changed, and what one station can't tell anyone.

Temperatures have two decimal places, rain and sunshine none, p two. When no
shuffle at all comes as far as the real difference, print p < 0.001 instead
of p = 0.00: 5,000 shuffles can't show a chance smaller than that.

Then draw the three charts, write story.html with page.story_page, the
report's lines and the three figures, print Saved story.html, and finish
with plt.show().
"""
import matplotlib.pyplot as plt

from charts import SOURCE, months_chart, rain_chart, temperature_chart
from page import figure_tag, story_page
from station import load_station, missing_months
from summary import compare, decades, normals, trend, yearly

MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]
EARLY = (1925, 1954)
LATE = (1995, 2024)


def p_text(p):
    """p as the report prints it."""
    return "p < 0.001" if p == 0 else f"p = {p:.2f}"


lines = []
station = load_station("ledger.csv")
years = yearly(station)
gaps = missing_months(station)

lines.append("The Clocktower Weather Report, 1925 to 2024")
lines.append(SOURCE)
lines.append("")
lines.append("The record")
lines.append(f"  {len(station)} months, missing months: {', '.join(gaps) if gaps else 'none'}")
temps = years["temp"]
lines.append(f"  Warmest year: {temps.idxmax()} ({temps.max():.2f} degrees C). "
             f"Coldest: {temps.idxmin()} ({temps.min():.2f} degrees C)")
rain = years["rain"]
lines.append(f"  Wettest year: {rain.idxmax()} ({rain.max():.0f} mm). Driest: {rain.idxmin()} ({rain.min():.0f} mm)")
lines.append("")

lines.append(f"Then and now: {LATE[0]} to {LATE[1]} against {EARLY[0]} to {EARLY[1]}")
temp_change, temp_p = compare(years, "temp", EARLY, LATE)
rain_change, rain_p = compare(years, "rain", EARLY, LATE)
sun_change, sun_p = compare(years, "sun", EARLY, LATE)
lines.append(f"  Temperature: {temp_change:+.2f} degrees C ({p_text(temp_p)})")
lines.append(f"  Rain: {rain_change:+.0f} mm a year ({p_text(rain_p)})")
lines.append(f"  Sunshine: {sun_change:+.0f} hours a year ({p_text(sun_p)})")
warming = trend(years, "temp")
lines.append(f"  Warming over the century: {warming:.2f} degrees C a decade")
then = normals(station, 1961, 1990)
now = normals(station, 1995, 2024)
warmed = now["temp"] - then["temp"]
lines.append(f"  Warmed most on the 1961 to 1990 normal: {MONTHS[warmed.idxmax() - 1]}, {warmed.max():+.2f} degrees C")
lines.append("")

lines.append("Conclusion")
lines.append(f"  The Clocktower is warmer than it was. The last thirty years averaged {temp_change:.2f} degrees C")
lines.append(f"  above the first thirty ({p_text(temp_p)}): shuffling the years almost never comes as")
lines.append(f"  far by chance. Most of the warming has come since the 1970s, and {MONTHS[warmed.idxmax() - 1]} has warmed most.")
lines.append("  Rain and sunshine have moved too, but no further than shuffling often moves them")
lines.append(f"  ({p_text(rain_p)} and {p_text(sun_p)}), so this record shows no clear change in either.")
lines.append("  It is one station on one building: it can say that the Clocktower has warmed, not why.")
lines.append("  Temperatures before 1961 were converted from Fahrenheit, and there is no sunshine")
lines.append("  record for 1941 to 1945.")

print("\n".join(lines))

normal = years.loc[1961:1990, "temp"].mean()
figures = [
    figure_tag(temperature_chart(years, normal)[0], "Each year's temperature, as a difference from the 1961 to 1990 average"),
    figure_tag(rain_chart(decades(years))[0], "Rain in an average year, decade by decade, from zero"),
    figure_tag(months_chart(then, now)[0], "Each month's temperature and rain, 1961 to 1990 and 1995 to 2024"),
]
with open("story.html", "w") as page_file:
    page_file.write(story_page(lines, figures))
print("Saved story.html")
plt.show()
