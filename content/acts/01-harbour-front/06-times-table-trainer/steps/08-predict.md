---
id: predict-nested
type: predict
title: A loop inside a loop
concept: for-loops
code: |
  for row in range(1, 3):
      for col in range(1, 4):
          print(row * col)
      print("End of row")
question: What does this print?
options:
  - text: |-
      1
      2
      3
      End of row
      2
      4
      6
      End of row
    correct: true
    feedback: "Right. For each row, the inner loop runs all the way through, then `End of row` prints. Then the next row starts."
  - text: |-
      1
      2
      3
      2
      4
      6
      End of row
    misconception: indented-line-runs-once
    feedback: "`print(\"End of row\")` is indented under the outer `for`, so it's part of every row. It runs once per row, after the inner loop."
  - text: |-
      1
      2
      3
      End of row
    misconception: loop-body-runs-once
    feedback: "The outer loop's body, inner loop and all, runs once for every row. `range(1, 3)` gives two rows."
  - text: |-
      1
      End of row
      2
      End of row
      3
      End of row
      2
      End of row
      4
      End of row
      6
      End of row
    misconception: unindented-line-in-loop
    feedback: "`print(\"End of row\")` lines up with the inner `for`, not with the line inside it. It waits until the inner loop has finished each row."
after: |
  Run it. Then put `print(row, col)` in place of `print(row * col)` to see each pass.
---
Ellie wants the whole times square for her wall. That needs a loop inside a loop.

Read the indents carefully. Each one says which loop a line belongs to.
