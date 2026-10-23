---
id: fix-type
type: fix
title: Piece three, the date
hints:
  nudge: "What type is `day`? What does `+` need on both sides when one side is text?"
  plan:
    - Read the last line of the error
    - Work out the type on each side of the +
    - Turn the number into text, or use an f-string
  shape: |
    day = 14
    print("Tides for March " + ___(day))
---
A **TypeError** means a value was the wrong type for what you asked. Here, `+` is joining text to a whole number.

`str(day)` turns the number into text. An f-string, like the one in Bea's till, also works.

Fix it so it prints `Tides for March 14`. The check also tries other days.
