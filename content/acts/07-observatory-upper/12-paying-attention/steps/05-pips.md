---
id: pips
type: pips
title: Pip's Version
files: [peek.py]
entry: peek.py
dialogue:
  - pip: "Attention, all in one go. Every column of weights adds up to 1. Very tidy."
  - pip: "And I scaled it by the size, 4. Moss used 2. Mine's twice as scaled."
dialogue_after:
  - pip: "Each query shares its attention out over the keys. So it's the rows that add up."
  - pip: "And the square root of 4 is 2. I knew that. I'd just stopped believing it."
hints:
  nudge: "Which way does one query's attention run: along a row of `weights`, or down a column? And what did Moss divide by?"
  plan:
    - Compare the row sums with the column sums
    - Softmax along the last axis, across the keys
    - Divide the scores by the square root of the key size
    - Check every row adds up to 1
  shape: |
    scores = Q @ K.T / np.sqrt(___)
    if mask is not None:
        scores = np.where(mask, -np.inf, scores)
    weights = softmax(scores, axis=___)
---
Pip's `attention` runs every query at once. Run it and read the last two lines.

Each row of `weights` is one query: how it shares its attention between the keys. Which should add up to 1, the rows or the columns? There are two bugs.
