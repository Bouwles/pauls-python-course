---
id: make
type: make
title: Make the noticeboard charts
timeout_ms: 20000
on_pass: { priya: "Bars from zero, the change drawn as a change, every axis named. I would sign these." }
hints:
  nudge: "For the warming chart, what do you take off every year's temperature before you draw it, and which line marks zero?"
  plan:
    - Make the figure and its axes
    - Draw the data
    - Name everything, with units
    - Check the scale is honest
    - Hand the figure back
  shape: |
    def warming_chart(temps):
        difference = temps - ___
        fig, ax = plt.subplots(figsize=(10, 4))
        ax.plot(difference.index, difference, label="each year")
        ax.plot(difference.index, difference.___(10).mean(), label="ten-year average")
        ax.___(0, color="grey", label="century average")
        ax.set_xlabel("year")
        ax.set_ylabel(___)
        ax.set_title(___)
        ax.___()
        return fig, ax


    def rain_histogram(rain):
        fig, ax = plt.subplots()
        ax.hist(rain, bins=___)
        ...
---
Write Priya's four chart functions. Each makes its own figure and returns `fig, ax`. The report at the bottom draws all four.

- `ax.axhline(0)` draws a horizontal line right across the axes at 0. It takes a `label=` like any line.
- `ax.hist(values, bins=range(0, 320, 20))` counts the values falling between each pair of edges, 0 to 20, 20 to 40 and so on, and draws a bar for each count.
- `ax.scatter(x, y)` draws a dot at each pair.

The labels in the brief are the ones Priya uses. The checks don't look at the pictures: they ask each axes what's on it. How many bars, lines or dots, where the scale starts, whether every axis is labelled with its units, a title, and a key wherever there's more than one line.
