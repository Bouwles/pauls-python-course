---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Binary search. Found the 10 mm in one look. One."
  - pip: "Nell says the 30 mm is in the last drawer. Mine says there isn't one. Nell's wrong, obviously."
dialogue_after:
  - pip: "So low and high meeting isn't the end. It's the last drawer left."
hints:
  nudge: "When `low` and `high` are the same drawer, is there still somewhere left to look?"
  plan:
    - Search for 30 and watch low and high on the last pass
    - Decide what the loop should do when they're equal
    - Change the condition so the last drawer left still gets opened
  shape: |
    while low ___ high:
---
Pip's `find_bolt` is nearly Moss's. Run it, then press Step through and watch `low` and `high` as it hunts for the 30 mm bolt.

The checks look for every bolt in the rack, not just the lucky ones, and try racks with one drawer and none.
