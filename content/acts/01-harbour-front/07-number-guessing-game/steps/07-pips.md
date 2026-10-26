---
id: pips
type: pips
title: Pip's Version
dialogue:
  - tom: "Penhallow wrote me a fog log, years back. Pip has been tidying it."
  - pip: "There were two input lines, exactly the same. I took one out. Faster."
  - pip: "It's been thinking since Tom typed 200. Very thorough, though."
dialogue_after:
  - pip: "So the second one wasn't a copy. It was the next reading."
hints:
  nudge: "After the first pass, what changes `reading`? Look inside the loop for a line that does."
  plan:
    - Run it, and press Stop when it hangs
    - Find the variable the while test depends on
    - Make the loop change it on every pass
  shape: |
    while reading != "clear":
        total = total + int(reading)
        count = count + 1
        reading = ___
---
Tom brought his fog log down to the Anchor. It asks for visibility readings until he types `clear`, then gives the average.

Run Pip's version. Type `200`, then wait. Nothing happens, and nothing will. The loop goes round and round with nothing to stop it: an **infinite loop**. Press **Stop**.

Then fix it so this works:

```
Visibility in metres? 200
Visibility in metres? 300
Visibility in metres? clear
Readings: 2
Average: 250.0 metres
```
