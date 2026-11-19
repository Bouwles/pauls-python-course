---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin.proud.wave: "Can you look at mine? It's a binary search and it found the 10 mm in one look, literally one."
  - caitlin.confused: "Neil says the 30 mm is in the last drawer, but mine reckons there isn't one at all. What's going on?"
dialogue_after:
  - caitlin.surprised: "Oh, so when low and high meet it isn't over yet, that's just the last drawer left to check."
hints:
  nudge: "When `low` and `high` are the same drawer, is there still somewhere left to look?"
  plan:
    - Search for 30 and watch low and high on the last pass
    - Decide what the loop should do when they're equal
    - Change the condition so the last drawer left still gets opened
  shape: |
    while low ___ high:
---
Caitlin's `find_bolt` is nearly Paul's. Run it, then press Step through and watch `low` and `high` as it hunts for the 30 mm bolt.

The checks look for every bolt in the rack, not just the lucky ones, and try racks with one drawer and none.
