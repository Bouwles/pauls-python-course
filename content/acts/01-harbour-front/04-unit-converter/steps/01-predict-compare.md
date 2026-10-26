---
id: predict-compare
type: predict
title: Faster than five
concept: comparisons
code: |
  speed = 5
  print(speed > 5)
  print(speed >= 5)
question: "Inside the harbour wall the limit is 5 knots. What does this print?"
options:
  - text: |-
      False
      True
    correct: true
    feedback: "Right. 5 is not more than 5, but it is more than or equal to it. A comparison gives back `True` or `False`."
  - text: |-
      True
      True
    misconception: greater-includes-equal
    feedback: "`>` means strictly more than, and 5 is not more than 5. `>=` is the one that lets 5 in."
  - text: An error
    misconception: comparison-needs-if
    error: SyntaxError
    feedback: "A comparison can go anywhere a value can, including inside `print()`. It works out to `True` or `False`."
after: |
  Now run it.
---
Every decision starts with a question that has a yes-or-no answer. Is it option 1? Is the boat going faster than the limit?

In Python those questions are **comparisons**: `<`, `>`, `<=`, `>=`, `==` (is equal to) and `!=` (is not equal to). The answer is a **bool**: `True` or `False`, with a capital letter and no quotes.

Commit to an answer, then run it.
