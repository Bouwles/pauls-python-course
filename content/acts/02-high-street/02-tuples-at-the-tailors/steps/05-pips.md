---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin: "Riya's tailor wants the smallest chest and the largest. Two returns, two answers. Done."
  - caitlin: "Except it says it can't unpack an int. I never gave it an int. Can you look?"
dialogue_after:
  - caitlin: "So the first return leaves and shuts the door. The second one never gets a turn."
hints:
  nudge: "How many times can a function return? Which of Caitlin's two returns actually happens?"
  plan:
    - Read the last line of the traceback
    - Work out what chest_range really gives back
    - Return both values in one return
  shape: |
    def chest_range(sizes):
        ...
        return ___, ___
---
Run Caitlin's program and read the traceback. Then fix it so it prints:

```
Chests run from 96 to 112 cm.
```

The checks also try other customers.
