---
id: pips
type: pips
title: Fix Riya's version
files: [main.py, crates.py]
entry: main.py
dialogue:
  - riya.pleased: "Caitlin's crates module packs the Studio's fruit order. I've borrowed it for my craft fair prints."
  - riya.confused: "It did the postcards. Then it forgot how to count. Can you look?"
dialogue_after:
  - riya.surprised: "I called the answer crates, and then crates wasn't the module any more. Same name, two jobs."
hints:
  nudge: "The first time round the loop, `crates` is the module. What is it the second time round?"
  plan:
    - Read the last line of the traceback
    - Find where the name crates is given a new value
    - Give the number its own honest name
  shape: |
    for product, items in deliveries.items():
        ___ = crates.crates_needed(items, PER_CRATE)
        print(f"{product}: {___} crates")
---
There are two files this time. `crates.py` is Caitlin's module; `main.py` is Riya's program, which imports it. Click the tabs to see each one.

Run it and read the traceback. Fix `main.py` so it prints:

```
postcards: 4 crates
posters: 2 crates
badges: 3 crates
```
