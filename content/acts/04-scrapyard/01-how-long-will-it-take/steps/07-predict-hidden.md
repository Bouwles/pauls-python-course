---
id: predict-hidden
type: predict
title: One loop, or two?
concept: big-o
code: |
  parts = ["axle", "bolt", "chain", "disc", "nut"]
  looks = 0
  for part in parts:
      for other in parts:
          looks = looks + 1
          if other == part:
              break
  print(looks)
question: What does this print?
options:
  - text: "15"
    correct: true
    feedback: "Right. Finding `axle` takes 1 look, `bolt` 2, and so on to `nut`'s 5: 15 in all. With n parts that's about half of n times n, which still grows like O(n²)."
  - text: "5"
    misconception: one-loop-is-linear
    feedback: "That counts one look per part. But each part is searched for from the front of the list, and the later ones take more looks: 1, 2, 3, 4, then 5."
  - text: "25"
    misconception: in-never-stops-early
    feedback: "That would be true without the `break`. A search stops at the first match, so `axle` takes 1 look and `nut` takes 5, not 5 each."
---
The inner loop does what `part in parts` does: it looks from the front until it finds the part, then stops.
