---
id: investigate
type: investigate
title: A year, day by day
concept: distributions
code: |
  import matplotlib.pyplot as plt
  import pandas as pd

  daily = pd.read_csv("daily.csv", index_col="date")
  rain = daily["rain"]

  print(rain.describe().round(2))
  print("median", rain.median(), "most common", rain.mode().tolist())
  print("dry share", round((rain < 0.2).mean(), 2))

  print(daily[["temp", "thornby"]].agg(["mean", "std"]).round(2))

  fig, ax = plt.subplots()
  ax.hist(rain, bins=range(0, 40, 2))
  ax.set_xlabel("rain in the day (mm)")
  ax.set_ylabel("days")
  ax.set_title("{{town}}, 2024")
  plt.show()
tasks:
  - id: median
    prompt: "Run it. The mean day had 2.62 mm of rain. How much did the median day have?"
    kind: answer
    accept: ["0.3", "0.3 mm", "0.3mm"]
    feedback: "0.3 mm, less than an eighth of the mean. Half the days had 0.3 mm or less."
    wrong: "Look for the 50% line in `describe()`, or the number after `median`."
  - id: tail
    prompt: "Look at the histogram. Most days pile up at one end and a few stretch away in a long tail. Which way does the tail point, left or right?"
    kind: answer
    accept: ["right", "to the right", "the right", "right, towards the wet days", "towards the right"]
    feedback: "Right, towards the wet days. A distribution with a long tail to the right is **skewed** right, and its mean is dragged out along the tail, past the median."
    wrong: "Where are the few very wet days: near 0, or far from it?"
  - id: dry-share
    prompt: "A day with less than 0.2 mm counts as dry. What share of the year's days were dry?"
    kind: answer
    accept: ["0.44", "44%", "44 percent", "0.44, or 44%", "about 0.44", "about 44%"]
    feedback: "0.44: 160 of the 366 days. `rain < 0.2` gives `True` or `False` for each day, and the mean of those is the share that were `True`."
    wrong: "It's the line beginning `dry share`."
  - id: thornby
    prompt: "{{town}} and Thornby, twenty miles inland, have the same average temperature. Which has the bigger standard deviation?"
    kind: answer
    accept: ["Thornby", "thornby, 6.3", "Thornby (6.3)"]
    feedback: "Thornby, 6.3 against 4.29. The **standard deviation** measures how far readings typically are from the mean. Same average, different year: the sea keeps {{town}}'s winters mild and its summers cool."
    wrong: "Read the `std` row of the last table."
  - id: above-mean
    prompt: "Add a variable `above_mean` holding how many days had more rain than the mean day."
    kind: run
    tests: |
      def counted(ctx):
          value = getattr(ctx.module(), "above_mean", None)
          if value is None:
              raise CheckFailed("Make a variable called above_mean.")
          if int(value) != 104:
              raise CheckFailed("Count the days whose rain is more than rain.mean().", expected=104, actual=value)


      TESTS = [custom("Days wetter than the mean", counted)]
    solution: |
      import matplotlib.pyplot as plt
      import pandas as pd

      daily = pd.read_csv("daily.csv", index_col="date")
      rain = daily["rain"]

      print(rain.describe().round(2))
      print("median", rain.median(), "most common", rain.mode().tolist())
      print("dry share", round((rain < 0.2).mean(), 2))

      print(daily[["temp", "thornby"]].agg(["mean", "std"]).round(2))

      above_mean = (rain > rain.mean()).sum()
      print(above_mean, "days wetter than the mean")

      fig, ax = plt.subplots()
      ax.hist(rain, bins=range(0, 40, 2))
      ax.set_xlabel("rain in the day (mm)")
      ax.set_ylabel("days")
      ax.set_title("{{town}}, 2024")
      plt.show()
---
`daily.csv` is the station's 2024, one row per day: rain in millimetres, the temperature in degrees C, and the temperature at Thornby's station, twenty miles inland.

`describe()` gives the count, mean, standard deviation, smallest, largest, and the quartiles: 25% of the readings are at or below the `25%` value, and so on. `mode()` gives the most common value, as a Series, in case several tie.

Run it, then answer the questions.
