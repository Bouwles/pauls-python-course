---
id: pips
type: pips
title: Pip's Version
files: [track.py, main.py]
entry: main.py
dialogue:
  - pip: "Q-learning on the old grid. I left numpy out. Twelve tiles don't need numpy."
  - pip: "He goes right on every single tile. Even under the pool. Even into the rock."
dialogue_after:
  - pip: "One list, twelve names for it. Every tile was learning into the same four numbers."
hints:
  nudge: "Pip's table is built with `*`. What does `*` do to a list that has another list inside it?"
  plan:
    - Run it and look at the arrows
    - "After training, print `Q[0][2] is Q[2][3]` and see what it says"
    - "Build the table so each tile gets a fresh list of four, with a comprehension"
  shape: |
    Q = [[[0.0] * 4 for col in range(___)] for row in range(___)]
---
Pip's Q-learning is Moss's worked example with lists instead of an array. `track.py` is Moss's grid, with `step`.

Run it, then fix it. The update itself is fine.
