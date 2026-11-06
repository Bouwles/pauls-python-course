---
id: learn-merge
type: learn
title: Lining two tables up
concept: merging
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Walter Rook", "Ella Hocking"],
      "occupation": ["fisherman", "pharmacist"],
  })
  trades = pd.DataFrame({
      "occupation": ["fisherman", "baker"],
      "sector": ["sea", "trade"],
  })
  print(len(people.merge(trades, on="occupation")))

  both = people.merge(trades, on="occupation", how="left")
  both["sector"] = both["sector"].fillna("unlisted")
  print(both)
---
`people.merge(trades, on="occupation")` lines two tables up by a shared column, the **key**, and gives back one table with the columns of both. Picture going down the census with the trades index in your other hand, writing each person's sector beside them.

By default a merge keeps only rows that match in both tables, an **inner** merge. A person whose occupation has no card is dropped, and nothing tells you. `how="left"` keeps every row of the left table, the one before `.merge`, with `NaN` where nothing matched. `fillna("unlisted")` fills those gaps.

The example prints `1`: the pharmacist has no card. Then the left merge keeps both people.

The usual slip is to trust the default and lose rows without noticing.
