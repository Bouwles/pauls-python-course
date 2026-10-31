---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "Aaesha's barometer, hour by hour. She wants to know when the pressure dropped, not what it was."
  - paul: "One row, so one direction. A window three wide."
code: |
  import numpy as np

  pressure = np.array([1012, 1012, 1011, 1011, 1004, 998, 997, 997, 998])
  kernel = np.array([-1, 0, 1])          # later minus earlier

  places = len(pressure) - len(kernel) + 1
  change = np.zeros(places, dtype=int)
  for i in range(places):
      window = pressure[i:i + len(kernel)]
      total = np.sum(window * kernel)
      change[i] = total

  print("Change over two hours:", change)
  print("Steepest drop starts at hour", change.argmin())
subgoals:
  - label: The readings and the kernel
    lines: [3, 4]
  - label: How many places the window fits
    lines: [6, 7]
  - label: At each place, the slice under the window
    lines: [8, 9]
  - label: Multiply and add
    lines: [10, 10]
  - label: Write it into the answer
    lines: [11, 11]
  - label: Read off what it found
    lines: [13, 14]
explain:
  prompt: "Why is the answer two numbers shorter than the readings?"
  answer: "A window three wide has to sit entirely on the readings. Its left end can start at hour 0 but no later than hour 6, which is 9 - 3 + 1 = 7 places. In two dimensions the same happens down and across: 8 - 3 + 1 = 6 each way for a 3 by 3 kernel on an 8 by 8 digit."
  concept: convolutions
---
The same method in one dimension. `[-1, 0, 1]` takes each hour's reading from the one two hours later, so a sudden drop shows up as a big negative number wherever the window sits across it.

In the Make, the window is two-dimensional: the slice is `image[i:i + kh, j:j + kw]`, and there are two loops, down and across.
