---
id: predict
type: predict
title: Where did it break?
concept: reading-tracebacks
code: |
  name = "Neil"
  print("Morning, " + name)
  laps = int("4.5")
  print("Laps:", laps)
question: Which line stops this program?
verify: crash-line
options:
  - text: Line 1
    misconception: error-is-at-the-top
    feedback: "Line 1 just puts a name on some text. Nothing wrong there. A program stops where the bad instruction is, not at the top."
  - text: Line 2
    misconception: plus-cannot-join-text
    feedback: "`+` joins two strings perfectly well: `\"Morning, \" + \"Neil\"` is `Morning, Neil`."
  - text: Line 3
    correct: true
    feedback: "Right. `int()` can't read text with a decimal point, so line 3 stops the program with a ValueError. Lines 1 and 2 had already run, so `Morning, Neil` printed first."
  - text: It runs to the end without stopping
    misconception: int-reads-decimals
    feedback: "`int()` only reads whole numbers. Given `\"4.5\"`, it stops the program at line 3."
after: |
  Now run it. `Morning, Neil` prints before the traceback, because line 2 ran fine.
---
Everything here is from the last two projects. Go through it a line at a time, as Python does.
