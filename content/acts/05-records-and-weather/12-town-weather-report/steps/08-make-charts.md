---
id: make-charts
type: make
title: The charts
files: [station.py, summary.py, charts.py]
entry: charts.py
starter_from: make-numbers
timeout_ms: 30000
dialogue:
  - yahya.thinking: "Three charts. Each one says what it measures, in what, and where it came from."
on_pass: { yahya.pleased.thumbs: "The warming drawn as a difference from a stated average, the rain from zero, and a source on every one." }
hints:
  nudge: "What does each chart need besides its data: labels with units, a title, a key, a scale from zero, a line of small print?"
  plan:
    - Make the figure and its axes
    - Draw the data
    - Name everything, with units
    - Check the scale is honest
    - Say where the numbers came from
    - Hand the figure back
  shape: |
    def temperature_chart(years, normal):
        difference = years["temp"] - ___
        fig, ax = plt.subplots(figsize=(10, 4))
        ax.plot(difference.index, difference, label="each year")
        ax.plot(difference.index, ___, label="ten-year average")
        ax.axhline(___, color="grey", label="1961 to 1990 average")
        ...
        fig.text(0.01, 0.01, ___, fontsize=8)
        return fig, ax


    def months_chart(then, now):
        fig, (temps, rain) = plt.subplots(1, 2, figsize=(11, 4))
        for table, label in [(then, "1961 to 1990"), (now, "1995 to 2024")]:
            temps.plot(table.index, table["temp"], label=label)
            ...
        rain.set_ylim(bottom=___)
---
`charts.py` draws the report's three charts from tables it's given, and hands each figure back, ready to be shown or put in a page. Yahya's rules are at the top of the file. The checks ask each axes what's on it: lines, bars, labels, titles, keys, where the scale starts, and the small print.

`fig.text(x, y, words, fontsize=8)` writes on the figure itself, outside the axes. `x` and `y` run from 0 to 1 across the whole figure, so `(0.01, 0.01)` is the bottom left corner.

Try the charts under `if __name__ == "__main__":` with your own `summary.py`, and `plt.show()`.
