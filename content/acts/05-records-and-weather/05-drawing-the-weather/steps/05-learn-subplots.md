---
id: learn-subplots
type: learn
title: Several charts on one page
concept: matplotlib
code: |
  import matplotlib.pyplot as plt

  fig, axes = plt.subplots(2, 2)
  axes[1, 0].set_title("Rain")
  fig.suptitle("Stornoway")
  print(axes.shape)
  print(axes[1, 0].get_title())
  plt.show()
---
`plt.subplots(rows, columns)` makes a figure with a grid of axes. `fig, axes = plt.subplots(2, 2)` gives four, in an array: `axes[1, 0]` is the bottom row, first column. With one row, `plt.subplots(1, 2)` gives two, which you can unpack: `fig, (left, right) = plt.subplots(1, 2)`.

Each chart is drawn on its own axes, with that axes' methods. `ax.set_title` titles one chart; `fig.suptitle` titles the whole page.

The example prints `(2, 2)`, then `Rain`.

The usual slip is to compare two panels by eye without checking their scales. Each axes fits its own scale to its own data. `plt.subplots(1, 2, sharey=True)` gives them one scale up the side.
