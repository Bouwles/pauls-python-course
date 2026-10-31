---
id: fix-syntax
type: fix
title: Script one, the header
dialogue:
  - neil: "First script. It won't even start."
  - neil: "See the duck on my desk? When you're stuck, explain the problem to it."
  - neil: "It won't answer. That's the point."
hints:
  nudge: "Count the brackets on the line the error points at. Does every ( have a )?"
  plan:
    - Read the last line of the error
    - Go to the line number it gives
    - Close the bracket that was never closed
  shape: |
    # Header for the help-desk board.
    print("THE STUDIO, FIRST FLOOR"___
    print("Help with bugs, every weekday")
---
A **SyntaxError** means Python couldn't read the code at all, so not even the first line runs. The `^` points at where Python noticed the problem.

Fix it so the header prints:

```
THE STUDIO, FIRST FLOOR
Help with bugs, every weekday
```
