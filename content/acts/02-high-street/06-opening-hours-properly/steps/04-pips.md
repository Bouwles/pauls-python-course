---
id: pips
type: pips
title: Pip's Version
files: [main.py, crates.py]
entry: main.py
dialogue:
  - pip: "Penhallow left Sanjay a crates module. I've used it for this week's deliveries."
  - pip: "It did the apples. Then it forgot how to count."
dialogue_after:
  - pip: "I called the answer crates, and then crates wasn't the module any more. Same name, two jobs."
hints:
  nudge: "The first time round the loop, `crates` is the module. What is it the second time round?"
  plan:
    - Read the last line of the traceback
    - Find where the name crates is given a new value
    - Give the number its own honest name
  shape: |
    for fruit, items in deliveries.items():
        ___ = crates.crates_needed(items, PER_CRATE)
        print(f"{fruit}: {___} crates")
---
There are two files this time. `crates.py` is Penhallow's module; `main.py` is Pip's program, which imports it. Click the tabs to see each one.

Run it and read the traceback. Fix `main.py` so it prints:

```
apples: 4 crates
pears: 2 crates
kale: 3 crates
```
