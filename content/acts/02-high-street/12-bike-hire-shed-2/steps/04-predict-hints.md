---
id: predict-hints
type: predict
title: Notes, not rules
concept: type-hints
code: |
  def fine(days_late: int, pence_a_day: int) -> int:
      return days_late * pence_a_day


  print(fine(3, 10))
  print(fine("3", 2))
question: What does this print?
options:
  - text: |-
      30
      33
    correct: true
    feedback: "Right. Type hints are notes for people and tools. Python doesn't check them when the program runs, so `\"3\" * 2` repeats the text."
  - text: 30, then a TypeError
    misconception: type-hints-enforced
    error: TypeError
    feedback: "Python doesn't check hints while it runs. An editor or a checker like mypy would warn you; the program itself carries on."
  - text: |-
      30
      6
    misconception: type-hints-convert
    feedback: "A hint doesn't convert anything. `\"3\"` stays text, and text times 2 is the text twice."
---
`days_late: int` is a **type hint**: a note saying what the function expects. `-> int` says what it gives back. Neil charges ten pence a day for a late book, and every penny goes to the trip fund.

Hints make code easier to read, and editors use them to catch mistakes as you type. Python itself mostly ignores them.
