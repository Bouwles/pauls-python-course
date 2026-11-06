---
id: predict
type: predict
title: Something goes wrong
concept: exceptions
code: |
  def per_person(bill, people):
      answer = bill / people
      return answer


  print("Each:", per_person(30, 6))
  print("Each:", per_person(30, 0))
  print("Bill done")
question: "What does this program print?"
options:
  - text: "Each: 5.0"
    correct: true
    feedback: "The division on line 2 raises a ZeroDivisionError. Nothing catches it, so it travels back up to line 7, which called `per_person`, and the whole program stops there."
  - text: |-
      Each: 5.0
      Bill done
    misconception: error-skips-line
    feedback: "Python doesn't skip a line that goes wrong and carry on. The error stops everything, so line 8 never runs."
  - text: |-
      Each: 5.0
      Each: None
      Bill done
    misconception: exception-stays-in-function
    feedback: "The error doesn't stay inside `per_person`, leaving it to hand back nothing. It travels back up to line 7, the line that called it, and with nothing to catch it, the program stops."
after: |
  Read the traceback from the bottom when you run it. It lists line 2, where it went wrong, and line 7, where `per_person` was called from.
---
The bill split between 6 people, then between 0.
