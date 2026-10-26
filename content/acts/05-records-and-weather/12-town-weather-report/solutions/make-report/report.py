"""The {{town}} Weather Report, for Priya Lund. Run it, and it prints the report
and draws its three charts.

It prints this, in this order, with every number worked out from ledger.csv
by your own functions, never typed in:

The {{town}} Weather Report, 1925 to 2024
Source: {{town}} Weather Station book, 1925 to 2024, at the Records Office

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

Then draw the three charts, and finish with plt.show().
"""
import matplotlib.pyplot as plt

from charts import SOURCE, months_chart, rain_chart, temperature_chart
from station import load_station, missing_months
from summary import compare, decades, normals, trend, yearly

MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]
EARLY = (1925, 1954)
LATE = (1995, 2024)


def p_text(p):
    """p as the report prints it."""
    return "p < 0.001" if p == 0 else f"p = {p:.2f}"


station = load_station("ledger.csv")
years = yearly(station)
gaps = missing_months(station)

print("The {{town}} Weather Report, 1925 to 2024")
print(SOURCE)
print()
print("The record")
print(f"  {len(station)} months, missing months: {', '.join(gaps) if gaps else 'none'}")
temps = years["temp"]
print(f"  Warmest year: {temps.idxmax()} ({temps.max():.2f} degrees C). "
      f"Coldest: {temps.idxmin()} ({temps.min():.2f} degrees C)")
rain = years["rain"]
print(f"  Wettest year: {rain.idxmax()} ({rain.max():.0f} mm). Driest: {rain.idxmin()} ({rain.min():.0f} mm)")
print()

print(f"Then and now: {LATE[0]} to {LATE[1]} against {EARLY[0]} to {EARLY[1]}")
temp_change, temp_p = compare(years, "temp", EARLY, LATE)
rain_change, rain_p = compare(years, "rain", EARLY, LATE)
sun_change, sun_p = compare(years, "sun", EARLY, LATE)
print(f"  Temperature: {temp_change:+.2f} degrees C ({p_text(temp_p)})")
print(f"  Rain: {rain_change:+.0f} mm a year ({p_text(rain_p)})")
print(f"  Sunshine: {sun_change:+.0f} hours a year ({p_text(sun_p)})")
warming = trend(years, "temp")
print(f"  Warming over the century: {warming:.2f} degrees C a decade")
then = normals(station, 1961, 1990)
now = normals(station, 1995, 2024)
warmed = now["temp"] - then["temp"]
print(f"  Warmed most on the 1961 to 1990 normal: {MONTHS[warmed.idxmax() - 1]}, {warmed.max():+.2f} degrees C")
print()

print("Conclusion")
print(f"  {{town}} is warmer than it was. The last thirty years averaged {temp_change:.2f} degrees C")
print(f"  above the first thirty ({p_text(temp_p)}): shuffling the years almost never comes as")
print(f"  far by chance. Most of the warming has come since the 1970s, and {MONTHS[warmed.idxmax() - 1]} has warmed most.")
print("  Rain and sunshine have moved too, but no further than shuffling often moves them")
print(f"  ({p_text(rain_p)} and {p_text(sun_p)}), so this record shows no clear change in either.")
print("  It is one station in one town: it can say that {{town}} has warmed, not why.")
print("  Temperatures before 1961 were converted from Fahrenheit, and there is no sunshine")
print("  record for 1941 to 1945.")

normal = years.loc[1961:1990, "temp"].mean()
temperature_chart(years, normal)
rain_chart(decades(years))
months_chart(then, now)
plt.show()
