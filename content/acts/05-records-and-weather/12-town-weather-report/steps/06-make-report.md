---
id: make-report
type: make
title: The report
files: [station.py, summary.py, charts.py, report.py]
entry: report.py
starter_from: make-charts
timeout_ms: 40000
dialogue:
  - yahya.neutral: "Numbers first, then what they mean. In words anyone would read to the end."
on_pass: { yahya.pleased: "It changes when the ledger does. So the numbers are the ledger's, not yours. Good." }
hints:
  nudge: "Which of your functions gives each line of the report? And what does the conclusion have to say, besides that it got warmer?"
  plan:
    - Import what you need from your three files
    - Load the station book, and work out the years
    - Print the title, the source and the record
    - Compare the two thirty years for each reading, and print each with its p
    - Print the trend and the month that warmed most
    - Write the conclusion
    - Draw the three charts, then plt.show()
  shape: |
    from charts import SOURCE, months_chart, rain_chart, temperature_chart
    from station import load_station, missing_months
    from summary import compare, decades, normals, trend, yearly

    station = load_station("ledger.csv")
    years = yearly(station)
    ...
    temps = years["temp"]
    print(f"  Warmest year: {temps.___()} ({temps.max():.2f} degrees C). ...")
    ...
    temp_change, temp_p = compare(years, "temp", EARLY, LATE)
    print(f"  Temperature: {temp_change:___} degrees C ({p_text(temp_p)})")
---
`report.py` puts it together: it prints the report and draws the charts. The exact layout is at the top of the file, and the checks read it line by line.

- `f"{change:+.2f}"` prints the sign whichever way it goes: `+0.86`, `-0.86`.
- `series.idxmax()` gives the label of the biggest value: for `years["temp"]`, a year.

The conclusion is yours: at least 50 words, printed under a line that says `Conclusion`. Say what changed and how sure you are, in words as well as p. Say plainly what didn't change. Say what one station can't tell anyone.

The checks run the report twice: once on the real ledger, and once on a ledger with the last ten years a degree warmer and 1982 much wetter. A number typed in by hand won't follow.
