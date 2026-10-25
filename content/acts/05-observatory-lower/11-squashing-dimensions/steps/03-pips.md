---
id: pips
type: pips
title: Pip's Version
files: [squash.py]
entry: squash.py
dialogue:
  - pip: "Twelve filters, and the first component holds 99.8 per cent of everything. Twelve readings are really one."
  - pip: "Professor Wendt says colour matters. My sums say it's two tenths of a per cent."
dialogue_after:
  - pip: "I found the direction to the average star. Not the directions the stars differ in."
  - wendt: "Well, the average star is a fine thing. It's just not news."
hints:
  nudge: "Compare Pip's covariance line with Moss's. What happened to the readings in Moss's version first?"
  plan:
    - Work out each filter's mean
    - Take the means off before the covariance
    - Leave the eigenvalues and the shares as they are
  shape: |
    centred = stars - stars.___(axis=0)
    spread = ___.T @ ___ / (len(stars) - 1)
---
Pip's squasher reads Penhallow's filter book: 200 stars, each measured through twelve coloured filters from blue to red, as magnitudes around 11. It prints the share of the variance held by the first three components.

Run it, then fix it. The checks also try the first few filters on their own.
