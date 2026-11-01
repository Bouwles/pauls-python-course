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
Python only reports the first problem it finds. Fix it, run again, read the next one.

When it works, Neil gets his race-day board back:

```
Race day at the indoor track
Practice 09:30
Race 16:00
```
