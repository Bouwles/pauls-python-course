---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin: "I've made Neil's report unbreakable. Nothing gets past my try."
  - caitlin: "Fifteen lines skipped out of fifteen, though. Can you look? Something's off."
dialogue_after:
  - caitlin: "It was my typo all along. The try was hiding it from me. Very loyal of it."
hints:
  nudge: "If every single line is skipped, is the log really that bad? What else could `except Exception` be catching?"
  plan:
    - Catch only ValueError, the error parse_line raises on purpose
    - Run it and read the traceback that appears
    - Fix the line it points to
  shape: |
          try:
              entry = parse_line(line, number)
              entries.append(___)
          except ___:
              skipped = skipped + 1
---
Caitlin has cut Neil's script down and wrapped the reading in a `try`. `except Exception:` catches every kind of error there is.

Run it and look hard at the numbers. Then fix it so it prints:

```
12 entries read, 3 skipped
```

The checks want an `except` that names the error it means to catch.
