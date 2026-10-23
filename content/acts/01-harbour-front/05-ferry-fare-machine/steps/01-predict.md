---
id: predict-compare
type: predict
title: Old enough
concept: comparisons
code: |
  age = 16
  print(age > 16)
  print(age >= 16)
question: What does this print?
options:
  - text: |-
      False
      True
    correct: true
    feedback: "Right. 16 is not more than 16, but it is more than or equal to it. A comparison gives back `True` or `False`."
  - text: |-
      True
      True
    misconception: greater-includes-equal
    feedback: "`>` means strictly more than, and 16 is not more than 16. `>=` is the one that lets 16 in."
  - text: An error
    misconception: comparison-needs-if
    error: SyntaxError
    feedback: "A comparison can go anywhere a value can, including inside `print()`. It works out to `True` or `False`."
after: |
  Now run it.
---
Every fare starts with a question that has a yes-or-no answer. Is the passenger under 5? Does the boat sail after seven?

In Python those questions are **comparisons**: `<`, `>`, `<=`, `>=`, `==` (is equal to) and `!=` (is not equal to).

Commit to an answer, then run it.
