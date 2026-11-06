---
id: pips
type: pips
title: Fix Caitlin's version
files: [squash.py]
entry: squash.py
dialogue:
  - caitlin.pleased: "Can you look at mine? Six kinds of goods, and the first component holds ninety-eight per cent of everything."
  - caitlin.confused: "So they're really one. Yahya says restaurants and shops buy differently. My sums say one per cent."
dialogue_after:
  - caitlin.surprised: "I found the direction to the average customer. Not the directions customers differ in."
  - yahya.unimpressed: "The average customer is a fine thing. It's just not a story."
hints:
  nudge: "Compare Caitlin's covariance line with Paul's. What happened to the readings in Paul's version first?"
  plan:
    - Work out each column's mean
    - Take the means off before the covariance
    - Leave the eigenvalues and the shares as they are
  shape: |
    centred = logged - logged.___(axis=0)
    spread = ___.T @ ___ / (len(logged) - 1)
---
Caitlin's squasher reads the 440 customers' spending, takes the log, and prints the share of the spread held by the first three components. Ninety-eight per cent in one direction is suspicious when restaurants and shops buy so differently.

Compare her covariance line with Paul's. Then fix it. The checks also try other kinds of goods on their own.
