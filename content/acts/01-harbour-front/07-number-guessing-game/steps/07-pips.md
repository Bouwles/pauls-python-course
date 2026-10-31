---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya: "My lap timer. There were two input lines, exactly the same. I took one out."
  - yahya: "Fewer lines, faster program. It's been thinking since I typed 92. Can you look?"
dialogue_after:
  - yahya: "So the second one wasn't a copy. It was the next lap. Fast and stuck is still stuck."
hints:
  nudge: "After the first pass, what changes `lap`? Look inside the loop for a line that does."
  plan:
    - Run it, and press Stop when it hangs
    - Find the variable the while test depends on
    - Make the loop change it on every pass
  shape: |
    while lap != "stop":
        total = total + int(lap)
        count = count + 1
        lap = ___
---
Yahya's lap timer asks for lap times in seconds until he types `stop`, then gives the average.

Run his version. Type `92`, then wait. Nothing happens, and nothing will. The loop goes round and round with nothing to stop it: an **infinite loop**. Press **Stop**.

Then fix it so this works:

```
Lap time in seconds? 92
Lap time in seconds? 88
Lap time in seconds? stop
Laps: 2
Average: 90.0 seconds
```
