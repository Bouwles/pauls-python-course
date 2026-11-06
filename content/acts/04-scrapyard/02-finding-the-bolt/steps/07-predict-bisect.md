---
id: predict-bisect
type: predict
title: Where would it go?
concept: bisect
code: |
  import bisect

  parts = ["body-tube", "bolt-M10", "bolt-M12", "bolt-M8", "gear-12t", "igniter"]
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
  Run it. Then print `parts[1:4]`: everything from where `bolt-` would go, up to the first name that doesn't start with it.
---
Three names, and where `bisect_left` would put each one in this list.

Notice `bolt-M10` before `bolt-M8`. Alphabetically, the 1 in 10 comes before 8.
