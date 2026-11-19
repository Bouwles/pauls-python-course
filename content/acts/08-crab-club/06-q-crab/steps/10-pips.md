---
id: pips
type: pips
title: Fix Yahya's version
files: [track.py, main.py]
entry: main.py
dialogue:
  - yahya.neutral: "Can you look at mine? It's Q-learning on the old grid, and twelve tiles don't need numpy because lists start faster."
  - yahya.confused: "The crab goes right on every single tile, even under the pool and even into the rock."
dialogue_after:
  - yahya.laughing: "It was one list with twelve names for it, so every tile was learning into the same four numbers. Fast, though."
hints:
  nudge: "Yahya's table is built with `*`. What does `*` do to a list that has another list inside it?"
  plan:
    - Run it and look at the arrows
    - "After training, print `Q[0][2] is Q[2][3]` and see what it says"
    - "Build the table so each tile gets a fresh list of four, with a comprehension"
  shape: |
    Q = [[[0.0] * 4 for col in range(___)] for row in range(___)]
---
Yahya's Q-learning is Paul's example with lists instead of an array. `track.py` is Paul's grid, with `step`. The update itself is fine.

Run it: every tile says go right. Fixed, each tile has its own four Q-values, and after 3000 races the arrows match the best line value iteration found with the map.
