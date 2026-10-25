---
id: explain
type: explain
title: Moss is warming the town
concept: correlation-causation
dialogue:
  - pip: "Moss gets a year older, Saltmarsh gets warmer. r is 0.63. I've asked him to stop."
  - moss: "I've been getting older since 1890. The warming started rather later."
code: |
  import numpy as np
  import pandas as pd

  station = pd.read_csv("station.csv")
  yearly = station.groupby("year")["temp"].mean()
  moss_age = yearly.index - 1890

  print(round(np.corrcoef(moss_age, yearly)[0, 1], 2))
  print(round(np.corrcoef(yearly.index, yearly)[0, 1], 2))
prompt: "Run it. The correlation is real. Why doesn't it mean Moss is warming the town?"
answer: "Moss's age goes up by exactly one a year, so it's the calendar in disguise: its correlation with the temperature is the same as the year's. Anything that grows steadily with time, the price of bread or the height of the sea wall, would correlate with a warming record just as well. A correlation says two things move together. It doesn't say one moves the other: here a third thing, time, carries both."
---
Pip has found a correlation of 0.63 between Moss's age and the temperature at Saltmarsh, over a hundred years. The second number printed is the correlation between the year itself and the temperature.

Write your answer, then compare it with Moss's.
