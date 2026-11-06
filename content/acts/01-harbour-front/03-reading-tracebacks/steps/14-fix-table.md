---
id: fix-table
type: fix
title: Script five, the board
dialogue:
  - neil.thinking.think: "Last script, the board itself. This one's hiding two."
on_pass: { neil.pleased.thumbs: "Both found. That board's going on the wall by the sim rig." }
hints:
  nudge: "Fix the first error Python reports, then run it again. The second only shows up once the first is gone."
  plan:
    - Read and fix the SyntaxError
    - Run again and read the new error
    - Fix that one too
  shape: |
    print("Race day at the " + track)
    print("Practice " + practice___
    print("Race " + ___)
---
The race-day board itself, with two mistakes in it. Python only reports the first problem it finds. Fix that one, run it again, and read the next.

When both are fixed, Neil gets his race-day board back:

```text
Race day at the indoor track
Practice 09:30
Race 16:00
```
