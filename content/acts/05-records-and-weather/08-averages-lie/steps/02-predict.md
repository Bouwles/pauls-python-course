---
id: predict
type: predict
title: An average week
concept: descriptive-statistics
dialogue:
  - yahya.thinking.point: "A week in November. Six quiet days and one that wasn't."
code: |
  import numpy as np

  week = [0.0, 0.0, 0.0, 0.4, 1.2, 2.0, 31.0]
  print(round(np.mean(week), 1), np.median(week))
question: What does this print?
options:
  - text: "4.9 0.4"
    correct: true
    feedback: "Right. The mean adds everything and shares it out, so the one wet day lifts it to 4.9 mm, more than six of the days had. The median is the middle value once they're in order: 0.4."
  - text: "4.9 15.5"
    misconception: median-is-midrange
    feedback: "15.5 is halfway between the smallest and largest, 0 and 31. The median is the middle reading once they're sorted: the fourth of seven, 0.4."
  - text: "4.9 0.0"
    misconception: median-is-mode
    feedback: "0.0 is the most common value, which is the mode. The median is the one in the middle of the sorted list: three below it, three above, 0.4."
after: |
  Run it. Then press Step through and watch `week`: the bars show the seven days side by side, already in order, and the median is the pile in the middle. Change 31.0 to 310.0 and run it again. Which number moves?
---
A week of rain at the Clocktower, already in order. `np.mean` and `np.median` work on a list as pandas' methods do on a Series.
