---
id: predict-enum
type: predict
title: On the shelf, or not
concept: enums
dialogue:
  - kat: "A book is on the shelf or it's on loan. Not 'out', not 'lent', not 'with Bea'. Two choices."
code: |
  from enum import Enum


  class Status(Enum):
      ON_SHELF = "on the shelf"
      ON_LOAN = "on loan"


  print(Status.ON_LOAN)
  print(Status.ON_LOAN.value)
  print(Status.ON_LOAN == "on loan")
question: What does this print?
options:
  - text: |-
      Status.ON_LOAN
      on loan
      False
    correct: true
    feedback: "Right. A member is its own thing, not its text. `.value` gets the text, and a member is never equal to a plain string."
  - text: |-
      on loan
      on loan
      True
    misconception: enum-member-is-its-value
    feedback: "`Status.ON_LOAN` is a member of `Status`, not the string. Its `.value` is the string."
  - text: |-
      Status.ON_LOAN
      on loan
      True
    misconception: enum-equals-value
    feedback: "A member only equals itself. Compare `status == Status.ON_LOAN`, or `status.value == \"on loan\"`."
---
An **Enum** is a fixed set of named choices. Each member has a name, `ON_LOAN`, and a value, `"on loan"`. A typo like `Status.ON_LAON` is an error straight away, instead of a string that quietly never matches.
