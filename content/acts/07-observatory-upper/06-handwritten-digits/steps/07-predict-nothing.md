---
id: predict-nothing
type: predict
title: Knowing nothing
concept: classification-networks
dialogue:
  - neil.thinking: "Before it learns anything, it gives every digit the same chance. What does that cost?"
code: |
  import numpy as np

  chances = np.full((5, 10), 0.1)        # five digits, a tenth on every answer
  labels = np.array([4, 9, 1, 7, 0])

  loss = -np.mean(np.log(chances[np.arange(5), labels]))
  print(round(loss, 3))
question: "A network that knows nothing gives each of the ten digits a chance of 0.1. What is its cross-entropy, to three places?"
kind: typed
accept: ["2.303", "2.3026"]
after: |
  That's minus the log of a tenth, whatever the labels are. When your network's first loss is near 2.3, it's guessing; if it starts far above, something is broken. Your Build prints its loss after the first epoch: watch it fall away from 2.3.
---
A network that knows nothing gives every digit the same chance, a tenth. Five digits, cross-entropy as in the last example.
