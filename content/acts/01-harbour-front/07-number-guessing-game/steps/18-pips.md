---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya.proud: "This is my data logger. There were two input lines exactly the same, so I took one out."
  - yahya.confused: "Fewer lines should mean a faster program, but it's been thinking ever since I typed 14. Can you look?"
dialogue_after:
  - yahya.surprised: "Oh, the second one wasn't a copy, it was the next reading. Being fast doesn't help much if it's stuck."
hints:
  nudge: "After the first pass, what changes `reading`? Look inside the loop for a line that does."
  plan:
    - Run it, and press Stop when it hangs
    - Find the variable the while test depends on
    - Make the loop change it on every pass
  shape: |
    while reading != "stop":
        total = total + int(reading)
        count = count + 1
        reading = ___
---
Yahya's logger takes readings from the weather station outside the Archive until he types `stop`, then gives the average.

Run it and type `14`. Nothing more happens, because his loop never ends and prints nothing while it goes round. Press **Stop**.

Then fix it so this works:

```
Reading? 14
Reading? 12
Reading? stop
Readings: 2
Average: 13.0 degrees
```

`:.1f` shows one decimal place, as `:.2f` shows two.
