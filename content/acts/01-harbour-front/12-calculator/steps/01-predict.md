---
id: predict
type: predict
title: Something goes wrong
concept: exceptions
code: |
  def per_mile(fuel, miles):
      answer = fuel / miles
      return answer


  print("Crossing:", per_mile(30, 6))
  print("Crossing:", per_mile(30, 0))
  print("Fuel log done")
question: "Python can't divide by zero. What does this program print?"
options:
  - text: "Crossing: 5.0"
    correct: true
    feedback: "Right. The division on line 2 raises a ZeroDivisionError. Nothing catches it, so it travels back up to line 7, which called `per_mile`, and the whole program stops there."
  - text: |-
      Crossing: 5.0
      Fuel log done
    misconception: error-skips-line
    feedback: "Python doesn't skip a line that goes wrong and carry on. The error stops everything, so line 8 never runs."
  - text: |-
      Crossing: 5.0
      Crossing: None
      Fuel log done
    misconception: exception-stays-in-function
    feedback: "The error doesn't stay inside `per_mile`, leaving it to hand back nothing. It travels back up to line 7, the line that called it, and with nothing to catch it, the program stops."
after: |
  Run it, and read the traceback from the bottom. It lists line 2, where it went wrong, and line 7, where `per_mile` was called from.
---
When something goes wrong as a program runs, Python **raises an exception**: a `ValueError`, a `NameError`, and here a `ZeroDivisionError`. In Reading Tracebacks, every one stopped the program.

This one happens inside a function.
