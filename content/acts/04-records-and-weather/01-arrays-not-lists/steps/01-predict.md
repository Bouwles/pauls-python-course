---
id: predict
type: predict
title: Twice the rain
concept: numpy-arrays
dialogue:
  - moss: "Same three numbers. Two kinds of box. Decide before you run it."
code: |
  import numpy as np

  rain_list = [80, 65, 72]
  rain_array = np.array([80, 65, 72])
  print(rain_list * 2)
  print(rain_array * 2)
question: What does this print?
options:
  - text: |-
      [80, 65, 72, 80, 65, 72]
      [160 130 144]
    correct: true
    feedback: "Right. A list times 2 is the list twice. An array times 2 doubles every number in it, all at once."
  - text: |-
      [160, 130, 144]
      [160 130 144]
    misconception: list-times-doubles
    feedback: "A list doesn't do arithmetic on what's inside it. `* 2` repeats a list, the same way `\"3\" * 2` gives `\"33\"`. Only the array doubles each number."
  - text: |-
      [80, 65, 72, 80, 65, 72]
      [80 65 72 80 65 72]
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

Three months from Mr Ashby's ledger, as a list and as an array.
