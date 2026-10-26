---
id: predict-bisect
type: predict
title: Where would it go?
concept: bisect
code: |
  import bisect

  parts = ["bell-ship", "bolt-M10", "bolt-M12", "bolt-M8", "gear-12t", "hubcap"]
  print(bisect.bisect_left(parts, "bolt-"))
  print(bisect.bisect_left(parts, "bolt-M12"))
  print(bisect.bisect_left(parts, "chain"))
question: What does this print?
options:
  - text: |-
      1
      2
      4
    correct: true
    feedback: "Right. `bolt-` sorts just before every name that starts with it, so it would go at 1, where the bolts begin. `bolt-M12` is at 2. A chain would go after the bolts and before the gear: 4."
  - text: |-
      1
      2
      -1
    misconception: bisect-missing-gives-minus-one
    feedback: "`bisect` never says not found. It says where `chain` would go to keep the list in order: after `bolt-M8`, before `gear-12t`, at 4."
  - text: |-
      True
      True
      False
    misconception: bisect-gives-true-false
    feedback: "`bisect` gives positions, not yes or no. To ask whether there's a chain, look at the name in the place it gives you."
after: |
  Run it. Then print `parts[1:4]`: everything from where `bolt-` would go, while the names still start with `bolt-`.
---
Python has binary search built in, in the `bisect` module. It answers a slightly different question from `find_bolt`: not "where is it?" but "where would it go?"

`bisect_left(parts, name)` gives the first place `name` could go and keep the list in order, and `bisect_right` the last. Both halve the list with each look, so both are O(log n), and both work on names as well as numbers, because strings compare alphabetically.

Notice `bolt-M10` before `bolt-M8`: alphabetically, 1 comes before 8.
