---
id: fix-syntax
type: fix
title: Script one, the header
dialogue:
  - neil.laughing: "First script, the header for my race-day board. It won't even start."
  - neil.neutral.point: "See the duck on my desk? When you're stuck, explain the problem to it."
  - neil.pleased: "It won't answer. That's the point."
hints:
  nudge: "Count the brackets on the line the error points at. Does every ( have a )?"
  plan:
    - Read the last line of the error
    - Go to the line number it gives
    - Close the bracket that was never closed
  shape: |
    # Header for the race-day board.
    print("KARTING CLUB, RACE DAY"___
    print("Helmets on, visors down")
---
Neil's header for his karting club's race-day board. Run it and read the last line: `'(' was never closed` means a bracket was opened and never shut. The `^` points at it.

Fix it so the header prints:

```text
KARTING CLUB, RACE DAY
Helmets on, visors down
```
