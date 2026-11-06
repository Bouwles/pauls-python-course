---
id: predict
type: predict
title: Two years on one chart
concept: matplotlib
dialogue:
  - yahya.thinking: "January to April, 1925 and 2024, on one chart. Then I want the rest of the century."
code: |
  import matplotlib.pyplot as plt

  months = ["Jan", "Feb", "Mar", "Apr"]
  temps = {
      "1925": [6.5, 6.6, 6.7, 8.6],
      "2024": [7.8, 7.4, 9.9, 11.0],
  }

  fig, ax = plt.subplots()
  for year, values in temps.items():
      ax.plot(months, values, label=year)
  print(len(ax.lines), ax.get_legend() is None)
  plt.show()
question: What does this print?
options:
  - text: "2 True"
    correct: true
    feedback: "Right. Each `plot` adds a line, so there are two. A `label=` is only remembered: the key isn't drawn until you call `ax.legend()`, so there's no legend yet."
  - text: "1 True"
    misconception: plot-replaces-line
    feedback: "The second `plot` doesn't rub out the first. Every call adds another line to the same axes, which is how 1925 and 2024 end up side by side."
  - text: "2 False"
    misconception: label-needs-no-legend
    feedback: "Two lines, yes. But a `label=` doesn't draw a key on its own. Until something calls `ax.legend()`, `get_legend()` gives `None`."
after: |
  Run it and look at the chart. Then add `ax.legend()` before the `print` and run it again.
---
Two years on one axes, each line with a `label=`. `ax.get_legend()` gives the key, or `None` if there isn't one.
