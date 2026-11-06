---
id: learn-merge-dupes
type: learn
title: One card, two rows
concept: merging
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Walter Rook", "Edith Rowe"],
      "occupation": ["fisherman", "baker"],
  })
  trades = pd.DataFrame({
      "occupation": ["fisherman", "fisherman", "baker"],
      "sector": ["sea", "sea", "trade"],
  })
  print(len(people.merge(trades, on="occupation", how="left")))

  cards = trades.drop_duplicates("occupation")
  print(len(people.merge(cards, on="occupation", how="left")))
---
A merge makes one row for every matching pair. If the index has two cards for `fisherman`, every fisherman matches both and comes out twice, and every count after that is wrong.

So keep one card per key before merging: `trades.drop_duplicates("occupation")` keeps the first card for each occupation. Or have pandas check: `validate="many_to_one"` in the merge promises each key is on at most one card, and stops with an error if it isn't.

The example prints `3`, with Walter in twice, then `2`.

The usual slip is to think two identical cards can't matter, since they say the same thing. They double the rows.
