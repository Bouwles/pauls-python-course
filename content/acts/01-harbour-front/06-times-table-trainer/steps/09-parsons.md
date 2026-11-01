---
id: parsons
type: parsons
title: The whole square
dialogue:
  - aaesha.neutral.point: "The whole square too, please. Rows and columns, every fact at once."
blocks:
  - { code: 'size = int(input("Size? "))', indent: 0 }
  - { code: "for row in range(1, size + 1):", indent: 0 }
  - { code: "for col in range(1, size + 1):", indent: 1 }
  - { code: 'print(f"{row * col:4}", end="")', indent: 2 }
  - { code: "print()", indent: 1 }
check: run
hints:
  nudge: "Which line should happen once per number, and which once per row? The bare print() finishes a row."
  plan:
    - Ask how big
    - One pass of the outer loop for each row
    - One pass of the inner loop for each number along the row
    - Finish the row after the inner loop
  shape: |
    size = int(input("Size? "))
    for row in range(1, size + 1):
        for col in range(1, size + 1):
            print(f"{row * col:4}", end="")
        ___
---
For every row, the inner loop goes all the way along the columns.

`print(..., end="")` prints without finishing the line, so the next number lands on the same line. A bare `print()` finishes it.

Put the lines in order and indent them.

```
Size? 3
   1   2   3
   2   4   6
   3   6   9
```
