---
id: predict-enum
type: predict
title: Exactly three stamps
concept: enums
dialogue:
  - mira: "Three kinds of stamp. Not four. Not 'first' one day and '1st class' the next."
code: |
  from enum import Enum


  class Stamp(Enum):
      FIRST = 135
      SECOND = 85


  print(Stamp.FIRST)
  print(Stamp.FIRST.value)
  print(Stamp.SECOND == 85)
question: What does this print?
options:
  - text: |-
      Stamp.FIRST
      135
      False
    correct: true
    feedback: "Right. A member is its own thing, not the number. `.value` gets the number, and a member is never equal to a plain 85."
  - text: |-
      135
      135
      True
    misconception: enum-member-is-its-value
    feedback: "`Stamp.FIRST` is a member of `Stamp`, not the number 135. Its `.value` is 135."
  - text: |-
      Stamp.FIRST
      135
      True
    misconception: enum-equals-value
    feedback: "A member only equals itself. Compare `stamp == Stamp.SECOND`, or `stamp.value == 85`."
---
An **Enum** is a fixed set of named choices. Each member has a name, `FIRST`, and a value, `135`. A typo like `Stamp.FRIST` is an error straight away, instead of a string that quietly never matches.
