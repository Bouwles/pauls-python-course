---
id: predict-kinds
type: predict
title: Six months, two charts
concept: matplotlib
code: |
  import matplotlib.pyplot as plt

  rain = [12, 25, 31, 38, 55, 41]

  fig1, bars_ax = plt.subplots()
  bars_ax.bar(["Jan", "Feb", "Mar", "Apr", "May", "Jun"], rain)

  fig2, hist_ax = plt.subplots()
  hist_ax.hist(rain, bins=[0, 20, 40, 60])

  print(len(bars_ax.patches), len(hist_ax.patches))
  plt.show()
question: What does this print?
options:
  - text: "6 3"
    correct: true
    feedback: "Right. A bar for each month, and a bar for each bin. The histogram's three bars count 1, 3 and 2 months."
  - text: "6 6"
    misconception: hist-bar-per-value
    feedback: "A histogram draws one bar per bin, not one per value. Three bins, three bars, each as tall as the number of months in it."
---
The same six months of rain, drawn as bars and as a histogram.
