---
id: predict-hints
type: predict
title: Notes, not rules
concept: type-hints
code: |
  def postage(stamps: int, price: int) -> int:
      return stamps * price


  print(postage(3, 85))
  print(postage("3", 2))
question: What does this print?
options:
  - text: |-
      255
      33
    correct: true
    feedback: "Right. Type hints are notes for people and tools. Python doesn't check them when the program runs, so `\"3\" * 2` repeats the text."
  - text: 255, then a TypeError
    misconception: type-hints-enforced
    error: TypeError
    feedback: "Python doesn't check hints while it runs. An editor or a checker like mypy would warn you; the program itself carries on."
  - text: |-
      255
      6
    misconception: type-hints-convert
    feedback: "A hint doesn't convert anything. `\"3\"` stays text, and text times 2 is the text twice."
---
`stamps: int` is a **type hint**: a note saying what the function expects. `-> int` says what it gives back.

Hints make code easier to read, and editors use them to catch mistakes as you type. Python itself mostly ignores them.
