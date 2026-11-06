---
id: learn-plot
type: learn
title: A line on a chart
concept: matplotlib
dialogue:
  - yahya.pleased: "Numbers on a page, nobody reads. Numbers on the wall, everybody argues about."
code: |
  import matplotlib.pyplot as plt

  months = ["Jan", "Feb", "Mar", "Apr"]
  temps = [6.5, 6.6, 6.7, 8.6]

  fig, ax = plt.subplots()
  ax.plot(months, temps, label="1925")
  ax.set_xlabel("month")
  ax.set_ylabel("temperature (degrees C)")
  ax.set_title("Stornoway, early 1925")
  ax.legend()
  print(len(ax.lines))
  plt.show()
---
**matplotlib** draws charts. Everyone imports its drawing part as `plt`.

`fig, ax = plt.subplots()` gives you a **figure**, the whole picture, and an **axes**, the framed box with scales that the data goes in. Picture a sheet of paper with one graph drawn on it: the sheet is the figure, the graph is the axes.

`ax.plot(x, y)` draws a line through the points. `set_xlabel`, `set_ylabel` and `set_title` name things. Give a line a `label=`, and `ax.legend()` draws the key. `plt.show()` puts the picture in the output.

The axes is an object you can ask about: `ax.lines` is a list of its lines, so the example prints `1`.

The usual slip is to expect a `label=` to appear by itself. No key is drawn until `ax.legend()`.
