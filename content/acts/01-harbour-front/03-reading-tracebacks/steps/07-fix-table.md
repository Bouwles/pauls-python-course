---
id: fix-table
type: fix
title: Script five, the table
dialogue:
  - moss: "Last script. This one's hiding two."
on_pass: { moss: "Both found. Agnes will want that first thing." }
hints:
  nudge: "Fix the first error Python reports, then run it again. The second only shows up once the first is gone."
  plan:
    - Read and fix the SyntaxError
    - Run again and read the new error
    - Fix that one too
  shape: |
    print("Tides for the " + quay)
    print("High water " + high_water___
    print("Low water " + ___)
---
Python only reports the first problem it finds. Fix it, run again, read the next one.

When it works, Agnes gets her tide table back:

```
Tides for the north quay
High water 06:42
Low water 12:55
```
