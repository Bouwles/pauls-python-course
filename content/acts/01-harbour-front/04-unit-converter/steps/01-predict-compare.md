---
id: predict-compare
type: predict
title: Faster than five
concept: comparisons
code: |
  pace = 5
  print(pace > 5)
  print(pace >= 5)
question: "Yahya's pace today is 5 minutes a kilometre. What does this print?"
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
Every decision starts with a question that has a yes-or-no answer. Is it option 1? Was today's run faster than yesterday's?

In Python those questions are **comparisons**: `<`, `>`, `<=`, `>=`, `==` (is equal to) and `!=` (is not equal to). The answer is a **bool**: `True` or `False`, with a capital letter and no quotes.

Lock in your answer, then run it.
