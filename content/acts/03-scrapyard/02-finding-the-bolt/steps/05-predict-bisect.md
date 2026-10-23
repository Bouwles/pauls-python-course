---
id: predict-bisect
type: predict
title: Where would it go?
concept: bisect
code: |
  import bisect

  rack = [6, 8, 8, 8, 10, 12]
  print(bisect.bisect_left(rack, 8))
  print(bisect.bisect_right(rack, 8))
  print(bisect.bisect_left(rack, 9))
question: What does this print?
options:
  - text: |-
      1
      4
      4
    correct: true
    feedback: "Right. The run of 8s starts at drawer 1 and the next thing after it is in drawer 4. A 9 would go between the last 8 and the 10: drawer 4 again."
  - text: |-
      1
      3
      4
    misconception: bisect-right-is-last-index
    feedback: "`bisect_right` isn't the last 8. It's the place just after it, where a new 8 would go on the end of the run: drawer 4."
  - text: |-
      1
      4
      -1
    misconception: bisect-missing-gives-minus-one
    feedback: "`bisect` never says not found. It says where 9 would go to keep the rack in order: after the 8s, before the 10, drawer 4."
  - text: |-
      True
      True
      False
    misconception: bisect-gives-true-false
    feedback: "`bisect` gives positions, not yes or no. To ask whether there's a 9, look at what's in the drawer it gives you."
after: |
  Run it. Then work out what `bisect.bisect_right(rack, 10) - bisect.bisect_left(rack, 8)` counts, and check.
---
Python has binary search built in, in the `bisect` module. It answers a slightly different question from `find_bolt`: not "where is it?" but "where would it go?"

`bisect_left(rack, 8)` gives the first drawer an 8 could go in and keep the rack in order. `bisect_right(rack, 8)` gives the last. Both halve the rack each look, so both are O(log n).
