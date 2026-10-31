---
id: fix-table
type: fix
title: Script five, the board
dialogue:
  - neil: "Last script. This one's hiding two."
on_pass: { neil: "Both found. That board can go back on the Studio door." }
hints:
  nudge: "Fix the first error Python reports, then run it again. The second only shows up once the first is gone."
  plan:
    - Read and fix the SyntaxError
    - Run again and read the new error
    - Fix that one too
  shape: |
    print("Help desk in the " + room)
    print("Opens " + opens___
    print("Closes " + ___)
---
Python only reports the first problem it finds. Fix it, run again, read the next one.

When it works, Neil gets his help-desk board back:

```
Help desk in the Studio
Opens 09:30
Closes 16:00
```
