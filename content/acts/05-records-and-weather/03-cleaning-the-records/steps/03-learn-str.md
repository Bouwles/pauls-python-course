---
id: learn-str
type: learn
title: Tidy every value at once
concept: data-cleaning
code: |
  import pandas as pd

  parish = pd.Series(["Bankside", "bankside", "BANKSIDE ", "church street"])
  print(len(parish.unique()))
  tidy = parish.str.strip().str.title()
  print(tidy.unique().tolist())
---
Typed-up text is rarely tidy. `Bankside`, `bankside` and `BANKSIDE ` are one parish to a person, but three different values to pandas.

`.str` gives a text column the string methods you know, applied to every value at once. `column.str.strip()` takes the spaces off both ends, and `.str.lower()` and `.str.title()` change the capitals. They chain: `.str.strip().str.title()`.

`.unique()` gives each different value once, and `.tolist()` turns it into a list to print. The example prints `4`, then `['Bankside', 'Church Street']`.

Each `.str` method hands back a new Series. The usual slip is to forget to keep it: assign it back with `register["parish"] = register["parish"].str.strip()`.
