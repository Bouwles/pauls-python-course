---
id: pips
type: pips
title: Pip's Version
files: [squash.py]
entry: squash.py
dialogue:
  - pip: "Six kinds of goods, and the first component holds ninety-eight per cent of everything. They're really one."
  - pip: "Sanjay says restaurants and shops buy differently. My sums say it's one per cent."
dialogue_after:
  - pip: "I found the direction to the average customer. Not the directions customers differ in."
  - wendt: "Well, the average customer is a fine thing. It's just not news."
hints:
  nudge: "Compare Pip's covariance line with Moss's. What happened to the readings in Moss's version first?"
  plan:
    - Work out each column's mean
    - Take the means off before the covariance
    - Leave the eigenvalues and the shares as they are
  shape: |
    centred = logged - logged.___(axis=0)
    spread = ___.T @ ___ / (len(logged) - 1)
---
Pip's squasher reads the 440 customers' spending, takes the log, and prints the share of the variance held by the first three components.

Run it, then fix it. The checks also try other kinds of goods on their own.
