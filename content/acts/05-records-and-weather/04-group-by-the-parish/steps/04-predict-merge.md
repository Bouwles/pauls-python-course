---
id: predict-merge
type: predict
title: The trades index
concept: merging
dialogue:
  - aaesha: "The Archive's trades index. Every occupation on a card, and the sector it belongs to."
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Walter Rook", "Edith Rowe", "Ella Hocking", "Sam Rook"],
      "occupation": ["fisherman", "baker", "pharmacist", "fisherman"],
  })
  trades = pd.DataFrame({
      "occupation": ["baker", "fisherman", "net maker"],
      "sector": ["trade", "sea", "sea"],
  })
  both = people.merge(trades, on="occupation")
  print(len(both))
question: What does this print?
options:
  - text: "3"
    correct: true
    feedback: "Right. By default `merge` keeps only the rows that find a match in both tables. There's no card for a pharmacist, so Ella Hocking quietly disappears."
  - text: "4"
    misconception: merge-keeps-all-rows
    feedback: "That's what you'd want, but it isn't the default. A plain `merge` is an inner merge: a row with no match in the other table is dropped, and nobody tells you."
  - text: "5"
    misconception: merge-keeps-both
    feedback: "Keeping every row from both tables, Ella and the net maker card included, is `how=\"outer\"`. The default keeps only the rows that match."
  - text: A KeyError
    misconception: merge-missing-key-errors
    error: KeyError
    feedback: "No error. An occupation with no card is simply left out, which is worse than an error, because nothing warns you."
after: |
  Run it. Then add `how="left"` to the merge and print `both`. Everyone in `people` stays, and Ella's sector is `NaN`.
---
`people.merge(trades, on="occupation")` lines the two tables up by occupation and gives back one table with the columns of both: each person gets the sector from the card that matches.

Nobody has added a card since 1990, and there were no pharmacists in these streets then.
