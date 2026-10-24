---
id: investigate
type: investigate
title: A century on one line
concept: matplotlib
dialogue:
  - priya: "One number a year. Twelve months of readings in each."
code: |
  import matplotlib.pyplot as plt
  import pandas as pd

  station = pd.read_csv("station.csv")
  yearly = station.groupby("year")["temp"].mean()

  fig, ax = plt.subplots(figsize=(10, 4))
  ax.plot(yearly.index, yearly, label="each year")
  ax.plot(yearly.index, yearly.rolling(10).mean(), label="ten-year average")
  ax.set_xlabel("year")
  ax.set_ylabel("temperature (degrees C)")
  ax.set_title("Saltmarsh, year by year")
  ax.legend()

  print(len(ax.lines))
  print(ax.get_ylim())
  print(yearly.idxmax(), round(yearly.max(), 2))
  plt.show()
tasks:
  - id: zero
    prompt: "Run it. `ax.get_ylim()` gives the bottom and top of the scale up the side. Does it start at zero?"
    kind: answer
    accept: ["no", "nope", "no, it doesn't", "it doesn't", "no it doesn't", "false", "no, about 9.7", "no, it starts at about 9.7", "no, 9.7"]
    feedback: "No: it runs from about 9.7 to 13.1. For a line, matplotlib fits the scale to the data, so a change of a degree fills the whole height."
    wrong: "Read the second line printed: two numbers, bottom and top."
  - id: rolling
    prompt: "`yearly.rolling(10).mean()` averages each year with the nine before it. In which year does the ten-year average line begin?"
    kind: answer
    accept: ["1934", "in 1934"]
    feedback: "1934. Before that there aren't ten years to average, so the first nine values are `NaN`, and matplotlib leaves a gap rather than inventing a line."
    wrong: "Print `yearly.rolling(10).mean().head(12)` and find the first number."
  - id: warmest
    prompt: "Which was the warmest year of the century?"
    kind: answer
    accept: ["2022", "2022, 12.99", "2022 12.99"]
    feedback: "2022, at 12.99 degrees. `idxmax()` gives the label of the biggest value, and here the labels are years."
    wrong: "It's the third line printed."
  - id: rain-bars
    prompt: "Underneath, make a second chart, `fig2, ax2 = plt.subplots()`, with each year's total rain as a bar: `station.groupby(\"year\")[\"rain\"].sum()`. Label its y axis with what it measures and the units."
    kind: run
    tests: |
      def rain_bars(ctx):
          import matplotlib.pyplot as plt

          try:
              module = ctx.module()
              ax2 = getattr(module, "ax2", None)
              if ax2 is None:
                  raise CheckFailed("Make the second chart with fig2, ax2 = plt.subplots().")
              bars = list(ax2.patches)
              if len(bars) != 100:
                  raise CheckFailed("One bar for each year: ax2.bar(...).", expected=100, actual=len(bars))
              totals = module.station.groupby("year")["rain"].sum()
              if max(abs(b.get_height() - t) for b, t in zip(bars, totals)) > 0.01:
                  raise CheckFailed("Each bar should be that year's total rain.")
              if "mm" not in ax2.get_ylabel():
                  raise CheckFailed("Label the y axis with what it measures and its units, like rain (mm).", actual=repr(ax2.get_ylabel()))
          finally:
              plt.close("all")


      TESTS = [custom("A bar of rain for every year", rain_bars)]
    solution: |
      import matplotlib.pyplot as plt
      import pandas as pd

      station = pd.read_csv("station.csv")
      yearly = station.groupby("year")["temp"].mean()

      fig, ax = plt.subplots(figsize=(10, 4))
      ax.plot(yearly.index, yearly, label="each year")
      ax.plot(yearly.index, yearly.rolling(10).mean(), label="ten-year average")
      ax.set_xlabel("year")
      ax.set_ylabel("temperature (degrees C)")
      ax.set_title("Saltmarsh, year by year")
      ax.legend()

      print(len(ax.lines))
      print(ax.get_ylim())
      print(yearly.idxmax(), round(yearly.max(), 2))

      totals = station.groupby("year")["rain"].sum()
      fig2, ax2 = plt.subplots(figsize=(10, 4))
      ax2.bar(totals.index, totals)
      ax2.set_xlabel("year")
      ax2.set_ylabel("rain (mm)")
      ax2.set_title("Rain at Saltmarsh, by year")
      plt.show()
---
`station.csv` is the station book: one row per month since 1925, with the average temperature in degrees C, the rain in millimetres and the hours of sunshine. The sunshine recorder was taken down from 1941 to 1945, so those months are blank.

The `set_` methods name things. `ax.bar(x, heights)` draws bars instead of a line.

Run it, then answer the questions.
