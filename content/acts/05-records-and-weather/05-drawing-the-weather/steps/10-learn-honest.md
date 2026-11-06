---
id: learn-honest
type: learn
title: Charts that don't fib
concept: honest-charts
dialogue:
  - yahya.unimpressed: "If your chart starts at forty, I will notice. I always notice."
code: |
  import matplotlib.pyplot as plt

  fig, ax = plt.subplots()
  ax.bar(["1920s", "2010s"], [8.1, 9.0])
  print(ax.get_ylim()[0])
  ax.set_ylim(bottom=7.5)
  print(ax.get_ylim()[0])
  plt.show()
---
A chart is honest when what the eye sees matches the numbers. Yahya's rules:

- **Bars start at zero.** A bar's length is its value. Start at 7.5, and a bar of 9 looks three times as tall as a bar of 8.
- **A line may zoom in**, because it shows change. Better still, draw the change itself: take the average off, and draw a line at 0.
- **Panels you compare share a scale.**
- **Every axis says what it measures, with units**, and the page says where the data came from.

matplotlib starts bars at 0 by itself. The example prints `0.0`, then `7.5`: one line made those bars fib. `set_ylim(bottom=0)` puts it right.

The usual slip is to zoom in to make a change easier to see. Then it's easy to see wrongly.
