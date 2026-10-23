---
id: predict-defaults
type: predict
title: Something to fall back on
concept: default-arguments
dialogue:
  - moss: "Most labels want one copy. Now and then, three."
code: |
  def label(item, copies=1):
      return f"{item} x{copies}"

  print(label("kettle"))
  print(label("clock", 3))
question: What does this print?
options:
  - text: |-
      kettle x1
      clock x3
    correct: true
    feedback: "Right. `copies` falls back to 1 when the call leaves it out, and takes the 3 when the call gives one."
  - text: An error, because the first call leaves out copies
    misconception: default-still-required
    error: TypeError
    feedback: "`copies=1` in the `def` line makes that argument optional. Leave it out and the function uses 1."
  - text: |-
      kettle xNone
      clock x3
    misconception: missing-argument-is-none
    feedback: "A missing argument gets the default written in the `def` line, here 1. Python never fills a gap with `None` on its own."
  - text: |-
      kettle x1
      clock x1
    misconception: default-overrides-argument
    feedback: "The default is only a fallback. When the call passes 3, `copies` is 3."
---
A **default argument** gives a parameter a value to use when the call leaves it out. `copies=1` in the `def` line is one.

Commit to an answer, then run it.
