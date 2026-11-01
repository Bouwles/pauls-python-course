---
id: explain
type: explain
title: The Clocktower is warming the city
concept: correlation-causation
dialogue:
  - caitlin.proud: "The Clocktower gets a year older, the city gets warmer. r is 0.63. Case closed."
  - paul.unimpressed: "It's been getting older since 1890. The warming started rather later."
code: |
  import numpy as np
  import pandas as pd

  station = pd.read_csv("station.csv")
  yearly = station.groupby("year")["temp"].mean()
  tower_age = yearly.index - 1890

  print(round(np.corrcoef(tower_age, yearly)[0, 1], 2))
  print(round(np.corrcoef(yearly.index, yearly)[0, 1], 2))
prompt: "Run it. The correlation is real. Why doesn't it mean the Clocktower is warming the city?"
answer: "The Clocktower's age goes up by exactly one a year, so it's the calendar in disguise: its correlation with the temperature is the same as the year's. Anything that grows steadily with time, the price of a coffee or the height of a tree, would correlate with a warming record just as well. A correlation says two things move together. It doesn't say one moves the other: here a third thing, time, carries both."
---
Caitlin has found a correlation of 0.63 between the Clocktower's age and the temperature outside it, over a hundred years. The second number printed is the correlation between the year itself and the temperature.

Write your answer, then compare it with Paul's.
