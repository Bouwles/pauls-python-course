---
id: investigate
type: investigate
title: A century on one line
concept: matplotlib
dialogue:
  - aaesha: "The station book is ours. For the wall I want a record anyone in the country can check."
  - aaesha: "The Met Office has kept one at Stornoway since 1873. Far north, and wetter than us."
code: |
  import matplotlib.pyplot as plt
  import pandas as pd

  station = pd.read_csv("stornoway.csv", parse_dates=["month"], index_col="month")
  station["temp"] = (station["tmax"] + station["tmin"]) / 2
  yearly = station["temp"].resample("YS").mean()

  fig, ax = plt.subplots(figsize=(10, 4))
  ax.plot(yearly.index.year, yearly, label="each year")
  ax.plot(yearly.index.year, yearly.rolling(10).mean(), label="ten-year average")
  ax.set_xlabel("year")
  ax.set_ylabel("temperature (degrees C)")
  ax.set_title("Stornoway, year by year")
  ax.legend()

  print(ax.get_ylim())
  print(yearly.idxmax().year, round(yearly.max(), 2))
  counts = station["temp"].resample("YS").count()
  print(counts[counts < 12])
  plt.show()
tasks:
  - id: zero
    prompt: "Run it. `ax.get_ylim()` gives the bottom and top of the scale up the side. Does it start at zero?"
    kind: answer
    accept: ["no", "nope", "no, it doesn't", "it doesn't", "no it doesn't", "false", "no, about 7.1", "no, it starts at about 7.1", "no, 7.1", "no, 7"]
    feedback: "No: it runs from about 7.1 to 9.6. For a line, matplotlib fits the scale to the data, so a change of a degree fills the whole height."
    wrong: "Read the first line printed: two numbers, bottom and top."
  - id: warmest
    prompt: "Which was the warmest year at Stornoway?"
    kind: answer
    accept: ["2014", "2014, 9.52", "2014 9.52"]
    feedback: "2014, at 9.52 degrees: a mean of the day's high and the night's low, every day of the year. `idxmax()` gives the label of the biggest value, here a date, and `.year` its year."
    wrong: "It's the second line printed."
  - id: missing
    prompt: "`resample(\"YS\")` puts the months into years, and `count()` counts the readings in each. Which year has fewer than twelve months of temperature?"
    kind: answer
    accept: ["1927", "in 1927"]
    feedback: "1927: April's thermometer readings were never sent in, so its mean is eleven months passed off as a year. Your dashboard will leave a year like that out of the yearly temperatures, as a gap, instead of quietly guessing."
    wrong: "It's in the last thing printed."
  - id: rain-bars
    prompt: "Underneath, make a second chart, `fig2, ax2 = plt.subplots()`, with each year's total rain as a bar: `station[\"rain\"].resample(\"YS\").sum()`, drawn against `.index.year`. Label its y axis with what it measures and the units."
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
              totals = module.station["rain"].resample("YS").sum()
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

      station = pd.read_csv("stornoway.csv", parse_dates=["month"], index_col="month")
      station["temp"] = (station["tmax"] + station["tmin"]) / 2
      yearly = station["temp"].resample("YS").mean()

      fig, ax = plt.subplots(figsize=(10, 4))
      ax.plot(yearly.index.year, yearly, label="each year")
      ax.plot(yearly.index.year, yearly.rolling(10).mean(), label="ten-year average")
      ax.set_xlabel("year")
      ax.set_ylabel("temperature (degrees C)")
      ax.set_title("Stornoway, year by year")
      ax.legend()

      print(ax.get_ylim())
      print(yearly.idxmax().year, round(yearly.max(), 2))
      counts = station["temp"].resample("YS").count()
      print(counts[counts < 12])

      totals = station["rain"].resample("YS").sum()
      fig2, ax2 = plt.subplots(figsize=(10, 4))
      ax2.bar(totals.index.year, totals)
      ax2.set_xlabel("year")
      ax2.set_ylabel("rain (mm)")
      ax2.set_title("Rain at Stornoway, by year")
      plt.show()
---
`stornoway.csv` is a real record: the Met Office's station at Stornoway, one row a month from 1925 to 2024, with the mean daily high and low in degrees C, the rain in millimetres and the hours of sunshine. The date is the index, so pandas can **resample** it: `resample("YS")` gathers the months into years, starting each January.

`rolling(10).mean()` averages each year with the nine before it.

Run it, then answer the questions.
