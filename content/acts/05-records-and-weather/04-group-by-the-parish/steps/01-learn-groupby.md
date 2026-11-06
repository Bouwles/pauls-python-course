---
id: learn-groupby
type: learn
title: Sort into piles, then count each pile
concept: groupby
dialogue:
  - yahya.thinking: "Everything by parish. Whoever kept the Archive before us did it with four piles of cards."
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Walter Rook", "Mary Rook", "Edith Rowe", "Sam Rook"],
      "parish": ["Northgate", "Northgate", "Bankside", "Bankside"],
      "age": [88, 52, 34, 9],
  })
  print(people.groupby("parish")["age"].mean())
---
`groupby` answers questions like "the average age in each parish". Picture sorting the census cards into one pile per parish, working something out for each pile, then writing the answers on one sheet: split, work out, put together.

`people.groupby("parish")` makes the piles. Pick a column with `["age"]`, then say what to do with each pile: `.mean()`, `.max()`, or `.size()` to count the rows. The answer is a Series with one value per parish, labelled by the parish names.

The example prints `Bankside 21.5` and `Northgate 70.0`.

The usual slip is to expect one answer per row. Each pile collapses to one answer, and the piles come out sorted by name.
