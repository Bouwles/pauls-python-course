---
id: predict-defaults
type: predict
title: Something to fall back on
concept: default-arguments
dialogue:
  - caitlin.thinking: "Locker codes are six digits. Unless I say otherwise, which I sometimes do."
code: |
  def test_code(length=6):
      return "0" * length

  print(test_code())
  print(test_code(4))
question: What does this print?
options:
  - text: |-
      000000
      0000
    correct: true
    feedback: "Right. `length` falls back to 6 when the call leaves it out, and takes the 4 when the call gives one."
  - text: An error, because the first call leaves out length
    misconception: default-still-required
    error: TypeError
    feedback: "`length=6` in the `def` line makes that argument optional. Leave it out and the function uses 6."
  - text: An error, because length is None in the first call
    misconception: missing-argument-is-none
    error: TypeError
    feedback: "A missing argument gets the default written in the `def` line, here 6. Python never fills a gap with `None` on its own."
  - text: |-
      000000
      000000
    misconception: default-overrides-argument
    feedback: "The default is only a fallback. When the call passes 4, `length` is 4."
---
A **default argument** gives a parameter a value to use when the call leaves it out. `length=6` in the `def` line is one.

This is Caitlin's test code for the new lockers where the Studio keeps its game controllers: all zeros, so whoever fits them can open them. Lock in your answer, then run it.
