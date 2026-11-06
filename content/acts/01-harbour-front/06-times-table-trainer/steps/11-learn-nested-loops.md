---
id: learn-nested-loops
type: learn
title: A loop inside a loop
concept: for-loops
code: |
  for row in range(1, 4):
      for col in range(1, 4):
          print(row * col, end=" ")
      print()
---
A loop's body can hold another loop. For every pass of the outer loop, the inner loop runs all the way through. Three rows of three make nine passes of the inner loop in all.

Each line's indent says which loop it belongs to. On the right, `print(row * col, end=" ")` is in the inner loop, so it runs for every number. The bare `print()` is only in the outer loop, so it runs once per row.

`end=" "` tells `print()` to finish with a space instead of starting a new line, so the next number lands on the same line. The bare `print()` then finishes the line.

The usual mistake is misreading an indent, and putting a line in the wrong loop.
