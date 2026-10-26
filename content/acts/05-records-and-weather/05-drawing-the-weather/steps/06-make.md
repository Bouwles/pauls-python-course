---
id: make
type: make
title: Make the dashboard
timeout_ms: 30000
files: [dashboard.py]
entry: dashboard.py
on_pass: { priya: "Bars from zero, the change drawn as a change, every axis named. I would sign these." }
hints:
  nudge: "For `yearly`, what does each year's mean need before it can be trusted? For the warming chart, what do you take off every year's temperature before you draw it, and which line marks zero?"
  plan:
    - "yearly: resample to years; the mean temperature where all twelve months are there; the rain and sunshine summed with min_count=12"
    - "Each chart: draw the data on the axes it's given, name everything, with units, and check the scale is honest"
    - "dashboard: make the figure and its axes, two by two"
    - Draw the data, each chart on its own axes
    - Name the whole page, with its source
    - Hand the figure back
  shape: |
    def yearly(station):
        by_year = station.resample(___)
        years = pd.DataFrame({
            "temp": by_year["temp"].mean().where(by_year["temp"].___() == 12),
            "rain": by_year["rain"].sum(min_count=___),
            "sun": ___,
        })
        years.index = years.index.___
        return years


    def warming_chart(ax, temps):
        difference = temps - ___
        ax.plot(difference.index, difference, label="each year")
        ax.plot(difference.index, difference.___(10).mean(), label="ten-year average")
        ax.___(0, color="grey", label="century average")
        ax.set_xlabel("year")
        ax.set_ylabel(___)
        ax.set_title(___)
        ax.___()
---
Write the dashboard in `dashboard.py`: `yearly`, four chart functions and `dashboard`. `load_station` and the headlines at the bottom are written.

```
Warmest year: 2014 (9.52 degrees C). Coldest: 1979 (7.19 degrees C)
Wettest year: 1999 (1547 mm). Driest: 1968 (800 mm)
```

Each chart draws on the axes it's handed, so `dashboard` can put all four on one page: `fig, axes = plt.subplots(2, 2)` gives `axes[0, 0]` to `axes[1, 1]`.

- `means.where(counts == 12)` keeps each mean where its year has twelve readings, and makes the rest `NaN`.
- `ax.axhline(0)` draws a line right across at 0, with a `label=` like any line.
- `ax.hist(values, bins=range(0, 320, 20))` counts the values between each pair of edges and draws a bar for each count.
- `ax.scatter(x, y)` draws a dot at each pair. `station.index.month == 7` picks out the Julys.
- `fig.suptitle` titles the whole page.

The checks ask each axes what's on it: bars, lines, dots, where the scale starts, labels, titles, keys.
