---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "The Workshop's tool loans book. Typed up by three people on three different days. It shows."
code: |
  import numpy as np
  import pandas as pd

  ledger = pd.DataFrame({
      "tool": [" spokeshave", "Clamps", "spokeshave ", "chisel", "clamps"],
      "lent": ["2024-03-02", "04/03/2024", "2024-03-02", "5 Mar 2024", "04/03/2024"],
      "days": ["3", "none", "3", "900", "none"],
  })

  clean = ledger.copy()

  clean["tool"] = clean["tool"].str.strip().str.lower()

  clean["days"] = pd.to_numeric(clean["days"].replace("none", "0"))

  iso = pd.to_datetime(clean["lent"], format="%Y-%m-%d", errors="coerce")
  slashed = pd.to_datetime(clean["lent"], format="%d/%m/%Y", errors="coerce")
  written = pd.to_datetime(clean["lent"], format="%d %b %Y", errors="coerce")
  clean["lent"] = iso.fillna(slashed).fillna(written)

  clean.loc[clean["days"] > 365, "days"] = np.nan

  clean = clean.drop_duplicates().reset_index(drop=True)
  print(clean)
subgoals:
  - label: Work on a copy
    lines: [10, 10]
  - label: Tidy the text
    lines: [12, 12]
  - label: Make the numbers numbers
    lines: [14, 14]
  - label: Read the dates, one format at a time
    lines: [16, 19]
  - label: Throw out the impossible
    lines: [21, 21]
  - label: Drop the duplicates, last
    lines: [23, 23]
explain:
  prompt: "Why does Paul drop the duplicates last, and not first, when there would be less to clean?"
  answer: "Before cleaning, the two spokeshave rows don't match: one has a space at the front, the other at the end, and the clamps differ by a capital. Only once the text and dates are tidied do the copies look identical, so only then can drop_duplicates() see them."
  concept: data-cleaning
---
- `.str.strip().str.lower()` tidies every value in a text column.
- `.replace("none", "0")` swaps whole values that match exactly. `pd.to_numeric` then reads the text as numbers.
- `pd.to_datetime(column, format=..., errors="coerce")` reads dates in one format, and gives `NaT`, "not a time", for any it can't read. `fillna` fills those gaps from the next format.
- `.loc[condition, column] = value` changes one column, in the rows where the condition holds.
- `reset_index(drop=True)` labels the rows 0, 1, 2 again, after rows have gone.

Nobody borrows a chisel for 900 days. Not even to fix the clock.
