---
id: predict
type: predict
title: Twice the marks
concept: numpy-arrays
dialogue:
  - moss: "Same three marks. Two kinds of box. Decide before you run it."
code: |
  import numpy as np

  marks_list = [12, 15, 9]
  marks_array = np.array([12, 15, 9])
  print(marks_list * 2)
  print(marks_array * 2)
question: "The school's old report cards were out of 40. What does this print?"
options:
  - text: |-
      [12, 15, 9, 12, 15, 9]
      [24 30 18]
    correct: true
    feedback: "Right. A list times 2 is the list twice. An array times 2 doubles every number in it, all at once."
  - text: |-
      [24, 30, 18]
      [24 30 18]
    misconception: list-times-doubles
    feedback: "A list doesn't do arithmetic on what's inside it. `* 2` repeats a list, the same way `\"3\" * 2` gives `\"33\"`. Only the array doubles each mark."
  - text: |-
      [12, 15, 9, 12, 15, 9]
      [12 15 9 12 15 9]
    misconception: array-is-a-list
    feedback: "An array looks like a list but isn't one. Arithmetic on an array happens to every number in it, so `* 2` doubles them."
  - text: An error on the last line
    misconception: array-needs-loop
    error: TypeError
    feedback: "No loop needed, and no error. Arithmetic on an array is applied to each number for you. That's most of the point of NumPy."
after: |
  Run it. The array prints without commas, which is how you tell the two apart at a glance.
---
NumPy is a library for working with a lot of numbers at once. Everyone imports it as `np`.

`np.array()` turns a list of numbers into an **array**: a block of numbers, all of the same type, stored side by side.

One student's three marks out of 20, as a list and as an array.
