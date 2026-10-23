---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Nobody numbers things from nought. So I started at one, like a person."
  - pip: "Mira says Bea's parcel has vanished. And then it crashes."
dialogue_after:
  - pip: "Hole nought, then. I'll tell Mira it was Penhallow's idea."
hints:
  nudge: "Which index does Bea's parcel have? Which numbers does `range(1, len(parcels) + 1)` give?"
  plan:
    - Run it and read the last line of the error
    - Write down the indexes the loop asks for
    - Make the loop ask for 0 to 3 instead
  shape: |
    parcels = ["Bea Hollis", "Old Tom", "Agnes Rook", "Gwen"]
    for hole in range(___):
        print(f"Hole {hole}: {parcels[hole]}")
---
Run Pip's version. Mira's holes are numbered from 0, like the list, and it should print:

```
Hole 0: Bea Hollis
Hole 1: Old Tom
Hole 2: Agnes Rook
Hole 3: Gwen
```

Fix it. Keep using `len`, so it still works on the day Mira has five parcels.
