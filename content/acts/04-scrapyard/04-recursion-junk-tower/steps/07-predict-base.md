---
id: predict-base
type: predict
title: Four laps at a time
concept: base-cases
code: |
  def laps_left(distance):
      if distance == 0:
          return 0
      return 1 + laps_left(distance - 4)


  print(laps_left(12))
  print(laps_left(10))
question: What happens when this runs?
verify: error
options:
  - text: It prints 3, then stops with a RecursionError
    correct: true
    error: RecursionError
    feedback: "Right. 12 goes 12, 8, 4, 0 and stops. 10 goes 10, 6, 2, -2, -6 and so on, stepping straight past 0, until Python has had a thousand calls waiting."
  - text: It prints 3, then 3
    misconception: base-case-exact-match
    feedback: "The base case only catches exactly 0. From 10 the calls go 10, 6, 2, -2: none of them is 0, so none of them stops."
  - text: It prints 3, then runs for ever
    misconception: no-base-case-runs-forever
    feedback: "A recursion that never stops doesn't run for ever. Every waiting call takes room on the call stack, and Python stops it with a RecursionError at about a thousand."
---
Each call counts one lap of 4 km and asks about the distance left.
