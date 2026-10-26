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
