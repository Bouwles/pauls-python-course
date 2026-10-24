---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Bea's Saturdays again. She wants to know how many loaves to bake."
  - bea: "Don't give me a formula. Tell me what I sold on Saturdays like this one."
code: |
  import numpy as np

  # Bea's Saturdays: ferry passengers, rain in mm, loaves sold
  saturdays = np.array([
      [310, 0.0, 52],
      [120, 8.5, 21],
      [250, 2.0, 44],
      [400, 0.5, 66],
      [180, 12.0, 25],
      [220, 4.0, 37],
      [350, 6.0, 49],
      [290, 1.0, 50],
      [150, 0.0, 33],
      [380, 9.0, 51],
  ])
  X = saturdays[:, :2]
  loaves = saturdays[:, 2]

  means = X.mean(axis=0)
  spreads = X.std(axis=0)
  X_scaled = (X - means) / spreads
  next_saturday = (np.array([330, 1.0]) - means) / spreads

  distances = np.sqrt(((X_scaled - next_saturday) ** 2).sum(axis=1))
  nearest = np.argsort(distances)[:3]

  print("Most like it: Saturdays", nearest + 1)
  print("They sold:", loaves[nearest])
  print(f"Bake about {loaves[nearest].mean():.0f} loaves")
subgoals:
  - label: The Saturdays
    lines: [3, 17]
  - label: Scale with the old Saturdays' ruler
    lines: [19, 22]
  - label: Measure every distance at once
    lines: [24, 24]
  - label: Find the k nearest
    lines: [25, 25]
  - label: Let them answer
    lines: [27, 29]
explain:
  prompt: "Line 25 uses `np.argsort(distances)[:3]`, not `np.sort(distances)[:3]`. Why?"
  answer: "`np.sort` gives the three smallest distances themselves, which say how near but not which Saturdays. Moss needs the Saturdays, to look up what they sold. `np.argsort` gives the positions in order of distance, nearest first, and those index straight into `loaves`."
  concept: knn
---
**k nearest neighbours** learns no weights at all. It keeps every past case, and to answer a new one it finds the k most like it and lets them decide: a vote for a word like `fog`, a mean for a number like loaves.

`X_scaled - next_saturday` subtracts next Saturday from every row at once, by broadcasting, so line 24 measures all ten distances in one go. `axis=1` adds up along each row: one distance per Saturday.

Straight-line distance is the usual choice. **Manhattan distance** adds up the plain differences, `np.abs(...).sum(axis=1)`, like walking a grid of streets instead of flying. Either way, scale first, or passengers in the hundreds drown out the rain.
