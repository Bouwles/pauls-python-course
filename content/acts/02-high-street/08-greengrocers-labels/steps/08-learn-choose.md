---
id: learn-choose
type: learn
title: Choosing what to write
concept: conditional-comprehensions
code: |
  scores = [7, 0, 9]
  marks = [score if score > 0 else "absent" for score in scores]
  print(marks)
---
An `if ... else` at the front of a comprehension keeps every item, and chooses what to write for each one. `[score if score > 0 else "absent" for score in scores]` means: the `score` if it's more than 0, otherwise `"absent"`, for each `score`.

Caitlin's answer sheet needs this. Every question gets a line, but a right answer and a wrong one get different lines.

Nothing is left out, so the new list is always as long as the old one. The example prints `[7, 'absent', 9]`.

So an `if` has two places. At the end, alone, it filters. At the front, with an `else`, it chooses.

The usual slip is to expect the front one to leave items out. It never does.
