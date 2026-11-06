---
id: predict-defensive
type: predict
title: Tidied, then checked
concept: defensive-input
code: |
  LEVELS = ("INFO", "WARN", "ERROR")
  for level in [" warn ", "Warning", "ERROR"]:
      print(level.strip().upper() in LEVELS)
question: What does this print?
options:
  - text: |-
      True
      False
      True
    correct: true
    feedback: "Tidied, ` warn ` is `WARN`, one of the levels. `WARNING` isn't, even though it starts with WARN."
  - text: |-
      True
      True
      True
    misconception: in-checks-part-of-item
    feedback: "On a tuple, `in` checks whole items. `WARNING` has WARN inside it, but it isn't WARN, so it isn't in `LEVELS`."
  - text: |-
      False
      False
      True
    misconception: input-is-clean
    feedback: "Each level is tidied before it's checked: `.strip()` takes the spaces off and `.upper()` makes the capitals, so ` warn ` becomes `WARN`."
---
Three levels as the drone's systems wrote them.
