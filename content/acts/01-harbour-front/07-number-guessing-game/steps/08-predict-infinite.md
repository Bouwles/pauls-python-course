---
id: predict-infinite
type: predict
title: Round and round
concept: infinite-loops
code: |
  laps = 0
  while laps < 3:
      print("Lap", laps)
  print("Pit stop")
question: What does this print?
verify: error
options:
  - text: It prints Lap 0 for ever and never reaches Pit stop
    correct: true
    feedback: "Nothing inside the loop changes `laps`, so `laps < 3` is `True` on every pass. A line like `laps = laps + 1` inside the loop would end it after three laps."
  - text: |-
      Lap 0
      Lap 1
      Lap 2
      Pit stop
    misconception: loop-condition-updates-itself
    feedback: "That needs a line inside the loop that adds 1 to `laps`. Without one, `laps` stays at 0 for ever."
  - text: |-
      Lap 0
      Pit stop
    misconception: while-is-if
    feedback: "A `while` doesn't stop after one pass. It goes back to the top and asks `laps < 3` again, and the answer is still `True`."
---
Neil's kart does three laps, then comes in for a pit stop. Or it's meant to.
