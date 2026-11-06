---
id: predict-priority
type: predict
title: Comparing tuples
concept: priority-queues
code: |
  print((3, "tyres") < (3, "chain"))
  print((1, "tyres") < (3, "chain"))
  print((3, 0, "tyres") < (3, 1, "chain"))
question: What does this print?
options:
  - text: |-
      False
      True
      True
    correct: true
    feedback: "Right. In the first, the 3s tie, so the names decide, and `tyres` comes after `chain`. In the last, the 3s tie and the arrivals decide: 0 before 1."
  - text: |-
      False
      True
      False
    misconception: ties-never-compare-rest
    feedback: "When the first items tie, Python goes on to the next item. In the last line that's the arrival count, and 0 is smaller than 1."
  - text: A TypeError
    misconception: tuples-cannot-compare
    error: TypeError
    feedback: "Tuples can be compared with `<`, item by item, as long as the items they reach can be compared. Numbers with numbers and text with text are fine."
---
Each line compares two jobs as a heap would.
