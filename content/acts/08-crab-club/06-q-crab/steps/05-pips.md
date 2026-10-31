---
id: pips
type: pips
title: Fix Yahya's version
files: [track.py, main.py]
entry: main.py
dialogue:
  - yahya: "Can you look at mine? Q-learning on the old grid. Twelve tiles don't need numpy. Lists start faster."
  - yahya: "The crab goes right on every single tile. Even under the pool. Even into the rock."
dialogue_after:
  - yahya: "One list, twelve names for it. Every tile was learning into the same four numbers. Fast, though."
hints:
  nudge: "Yahya's table is built with `*`. What does `*` do to a list that has another list inside it?"
  plan:
    - Run it and look at the arrows
    - "After training, print `Q[0][2] is Q[2][3]` and see what it says"
    - "Build the table so each tile gets a fresh list of four, with a comprehension"
  shape: |
    Q = [[[0.0] * 4 for col in range(___)] for row in range(___)]
---
Yahya's Q-learning is Paul's worked example with lists instead of an array. `track.py` is Paul's grid, with `step`.

Run it, then fix it. The update itself is fine.
