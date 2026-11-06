---
id: learn-bigram
type: learn
title: Counting what comes next
concept: language-models
code: |
  import numpy as np

  vocab = ["a", "e", "s"]
  ids = [2, 1, 1, 2, 1, 0, 2, 1]                  # "seesease", as ids

  counts = np.zeros((3, 3))
  for a, b in zip(ids, ids[1:]):                  # this character, then the next
      counts[a, b] += 1
  print(counts)

  smoothed = counts + 0.1
  probs = smoothed / smoothed.sum(axis=1, keepdims=True)    # each row adds up to 1
  print(probs.round(2))
---
A **language model** gives the chances of each possible next token. The simplest looks one character back, and counts.

Go through the text a pair at a time, this character then the next, and add 1 to `counts[this, next]`. Then divide each row by its own total, and row `a` becomes the chances of each character coming after `a`. One-character-back models are called **bigram** models.

Some pairs never happened, so their count is 0, and a chance of 0 means impossible. That's too sure: new text might have them. So add a little, the **smoothing**, to every count first. In the example 0.1 is added, and after an `s` the model gives `e` a chance of `0.94`.

The usual mistake is dividing each column by its total. It's the rows that must add up to 1.
