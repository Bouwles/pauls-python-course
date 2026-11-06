---
id: fix-type
type: fix
title: Script three, the date
hints:
  nudge: "What type is `day`? What does `+` need on both sides when one side is text?"
  plan:
    - Read the last line of the error
    - Work out the type on each side of the +
    - Turn the number into text, or use an f-string
  shape: |
    day = 14
    print("Launch day, March " + ___(day))
---
Neil's first model rocket went up on 14 March, and this script was meant to say so. Run it and read the last line of the traceback.

Fix it with `str()` or an f-string, so it prints `Launch day, March 14`. The check also tries other days, so the number has to come from `day`, not be typed into the text.
