---
id: fix-stock
type: fix
title: Fix the stock sheets
files: [stock.py, main.py]
entry: main.py
on_pass: { caitlin.pleased: "Thirty-five left of forty. Five sold. That's the morning I remember." }
hints:
  nudge: "What does `copy()` copy, and what does it leave shared?"
  plan:
    - Find the line that makes each day's sheet
    - Copy the inner dictionaries as well as the outer one
    - Run it and check Saturday starts from 40 loaves
  shape: |
    import copy


    def new_day():
        """Return a fresh stock sheet for the day, from the standard bake."""
        return copy.___(STANDARD_BAKE)
---
Here is the same program as Caitlin left it: the sheets in `stock.py`, Friday and Saturday in `main.py`. Fix `stock.py` so every day gets a sheet of its own.

When it's right, `main.py` prints:

```
bread: 35 left of 40
buns: 60 left of 60
brownies: 12 left of 12
```

The checks also open new days of their own and make sure the standard bake never changes.
