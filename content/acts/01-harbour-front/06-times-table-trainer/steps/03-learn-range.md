---
id: learn-range
type: learn
title: Which numbers range gives
concept: range
code: |
  for n in range(1, 5):
      print(n)
---
`range()` hands a `for` loop its numbers, one for each pass.

- `range(4)` gives 0, 1, 2, 3. It starts at 0 and stops before 4: four numbers, but not 4 itself.
- `range(1, 5)` starts at 1 and stops before 5: 1, 2, 3, 4.
- A third number is the step, how far to move each time. `range(1, 10, 2)` gives 1, 3, 5, 7, 9, and `range(5, 0, -1)` counts down 5, 4, 3, 2, 1.

The usual mistake is expecting the stop number to be included. It never is. To finish on 12, stop at 13: `range(1, 13)`.
