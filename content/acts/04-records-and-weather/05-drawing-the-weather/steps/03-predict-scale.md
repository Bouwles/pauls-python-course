---
id: predict-scale
type: predict
title: Where the scale starts
concept: honest-charts
dialogue:
  - priya: "Same two numbers, two charts. One of them is about to tell a fib."
code: |
  import matplotlib.pyplot as plt

  decades = ["1920s", "2010s"]
  temps = [11.1, 12.0]

  fig, (left, right) = plt.subplots(1, 2)
  left.bar(decades, temps)
  right.plot(decades, temps)
  print(left.get_ylim()[0], right.get_ylim()[0] > 10)
  plt.show()
question: What does this print?
options:
  - text: "0.0 True"
    correct: true
    feedback: "Right. matplotlib starts a bar chart at 0, because a bar's length is its value. A line it fits to the data, from just under 11.1 to just over 12.0, so a ninth of a degree looks like a cliff."
  - text: "0.0 False"
    misconception: axis-starts-at-zero
    feedback: "Only the bars start at 0. For a line, matplotlib fits the scale to the data and starts it just below the smallest value, about 11."
  - text: "11.055 True"
    misconception: bars-zoom-to-fit
    feedback: "matplotlib treats bars differently from lines. Bars are drawn up from 0, so it keeps 0 on the scale; only the line's scale is fitted to the data."
after: |
  Run it and look at the two charts. Same numbers. On the right, the 2010s look several times warmer than the 1920s.
---
`plt.subplots(1, 2)` makes a figure with two axes side by side, one row and two columns. Here they're unpacked into `left` and `right`.

`get_ylim()` gives the bottom and top of an axes' scale.
