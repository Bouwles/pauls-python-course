---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Mr Okonjo wants the smallest chest and the largest. Two returns, two answers."
  - pip: "It says it can't unpack an int. I never gave it an int."
dialogue_after:
  - pip: "So the first return leaves and shuts the door. The second one never gets a turn."
hints:
  nudge: "How many times can a function return? Which of Pip's two returns actually happens?"
  plan:
    - Read the last line of the traceback
    - Work out what chest_range really gives back
    - Return both values in one return
  shape: |
    def chest_range(sizes):
        ...
        return ___, ___
---
Run Pip's program and read the traceback. Then fix it so it prints:

```
Chests run from 96 to 112 cm.
```

The checks also try other clients.
