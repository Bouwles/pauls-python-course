---
id: predict-subplots
type: predict
title: Two panels, two scales
concept: matplotlib
code: |
  import matplotlib.pyplot as plt

  fig, axes = plt.subplots(1, 2)
  axes[0].bar(["1968"], [800])
  axes[1].bar(["1999"], [1547])
  print(axes[0].get_ylim()[1] == axes[1].get_ylim()[1])
  plt.show()
question: "`get_ylim()` gives the bottom and top of an axes' scale. What does this print?"
options:
  - text: "False"
    correct: true
    feedback: "Right. Each panel fits its own scale, so both bars nearly fill their boxes, and 800 mm looks as tall as 1,547. `sharey=True` would give them one scale."
  - text: "True"
    misconception: subplots-share-scale
    feedback: "Panels don't share a scale unless you ask. Each one fits its own data, so the tops are different."
---
The driest year and the wettest, side by side.
