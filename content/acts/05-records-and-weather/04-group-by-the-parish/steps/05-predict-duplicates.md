---
id: predict-duplicates
type: predict
title: One card, filed twice
concept: merging
dialogue:
  - pip: "The fisherman card's in twice. Doesn't matter. Same card, same answer."
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Walter Rook", "Edith Hollis", "Ella Hocking", "Sam Rook"],
      "occupation": ["fisherman", "baker", "pharmacist", "fisherman"],
  })
  trades = pd.DataFrame({
      "occupation": ["baker", "fisherman", "fisherman"],
      "sector": ["trade", "sea", "sea"],
  })
  both = people.merge(trades, on="occupation", how="left")
  print(len(both))
question: What does this print?
options:
  - text: "6"
    correct: true
    feedback: "Right. Each fisherman matches two cards, so each comes out twice. Edith matches one, and Ella, with no card, keeps her row because of `how=\"left\"`."
  - text: "4"
    misconception: merge-duplicate-key-ignored
    feedback: "That's Pip's guess. `merge` makes one row for every matching pair, and doesn't check whether two cards say the same thing. Two cards for fisherman means two rows for each fisherman."
  - text: A ValueError
    misconception: merge-refuses-duplicates
    error: ValueError
    feedback: "pandas doesn't object unless you ask it to. It makes a row for every match, so the fishermen are counted twice."
after: |
  Run it. Then add `validate="many_to_one"` to the merge, which promises that each occupation has at most one card, and run it again. Now pandas refuses, and says why.
---
Same people. This time the trades index has the fisherman card in twice, which happens to a box of cards filed by hand for forty years.

The merge is a left merge now, so everyone in `people` stays.
