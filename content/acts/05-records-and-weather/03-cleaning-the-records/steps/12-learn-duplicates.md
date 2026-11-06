---
id: learn-duplicates
type: learn
title: Each row once
concept: data-cleaning
code: |
  import pandas as pd

  crew = pd.DataFrame({"name": ["Peter Jago", "peter jago ", "Helen Rowe"]})
  print(crew.duplicated().sum())

  crew["name"] = crew["name"].str.strip().str.title()
  print(crew.duplicated().sum())
  print(crew.drop_duplicates().reset_index(drop=True))
---
`table.duplicated()` marks each row that exactly matches an earlier one, and `table.drop_duplicates()` gives back the table without them. Every value has to match: a space, a capital or a date written another way, and the rows count as different.

So drop duplicates last, once everything else is tidy and the copies really look alike. The example finds `0` copies, tidies the names, then finds `1` and drops it.

Dropping rows leaves gaps in the labels, like 0, 1 and 3. `reset_index(drop=True)` labels the rows 0, 1, 2 again, and `drop=True` throws the old labels away.

The usual slip is to drop duplicates first, to save work. Then the messy copies all stay.
