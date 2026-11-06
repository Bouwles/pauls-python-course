---
id: predict-compare
type: predict
title: Faster than three hundred
concept: comparisons
code: |
  speed = 300
  print(speed > 300)
  print(speed >= 300)
question: "What does this print?"
options:
  - text: |-
      False
      True
    correct: true
    feedback: "Right. 300 is not more than 300, but it is more than or equal to it. Each comparison gives back a bool, and `print()` shows it."
  - text: |-
      True
      True
    misconception: greater-includes-equal
    feedback: "`>` means strictly more than, and 300 is not more than 300. `>=` is the one that lets 300 in."
  - text: An error
    misconception: comparison-needs-if
    error: SyntaxError
    feedback: "A comparison can go anywhere a value can, including inside `print()`. It works out to `True` or `False`."
---
Neil hit exactly 300 km/h on the racing simulator. Two comparisons, one with `>` and one with `>=`.
