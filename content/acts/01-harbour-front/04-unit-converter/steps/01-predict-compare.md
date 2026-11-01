---
id: predict-compare
type: predict
title: Faster than three hundred
concept: comparisons
code: |
  speed = 300
  print(speed > 300)
  print(speed >= 300)
question: "Neil hit exactly 300 km/h on the racing simulator. What does this print?"
options:
  - text: |-
      False
      True
    correct: true
    feedback: "Right. 300 is not more than 300, but it is more than or equal to it. A comparison gives back `True` or `False`."
  - text: |-
      True
      True
    misconception: greater-includes-equal
    feedback: "`>` means strictly more than, and 300 is not more than 300. `>=` is the one that lets 300 in."
  - text: An error
    misconception: comparison-needs-if
    error: SyntaxError
    feedback: "A comparison can go anywhere a value can, including inside `print()`. It works out to `True` or `False`."
after: |
  Now run it.
---
Every decision starts with a question that has a yes-or-no answer. Is it option 1? Was today's lap faster than yesterday's?

In Python those questions are **comparisons**: `<`, `>`, `<=`, `>=`, `==` (is equal to) and `!=` (is not equal to). The answer is a **bool**: `True` or `False`, with a capital letter and no quotes.

Lock in your answer, then run it.
