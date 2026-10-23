---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Mira's lookup. Missing names come back empty, so I check for empty."
  - pip: "It says KeyError. I never said Key anything."
dialogue_after:
  - pip: "So a missing key isn't blank. It's a crash. .get is the polite way to ask."
hints:
  nudge: "What does `book[name]` do when the name isn't a key at all? Read the traceback."
  plan:
    - Find the line that crashes
    - Ask for the name in a way that can't crash
    - Check the known names still work
  shape: |
    while name != "":
        if book.___(name, "") == "":
            print(f"No address for {name}.")
        else:
            print(f"{name}: {book[name]}")
        name = input("Name? ")
---
Run Pip's lookup and type `Captain Ferro`, then a blank line. It should say:

```
No address for Captain Ferro.
```

Fix it so names that aren't in the book don't crash it.
