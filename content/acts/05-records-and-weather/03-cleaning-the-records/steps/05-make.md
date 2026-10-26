---
id: make
type: make
title: Make the cleaning pipeline
timeout_ms: 20000
on_pass: { ashby: "Peter Jago, once. Helen Rowe, once. My grandfather, once. Nobody aged 412." }
hints:
  nudge: "Each step is one of Moss's comments, turned into a function that takes a table and gives back a cleaner copy. What does `clean_register` do with the list of them?"
  plan:
    - "parse_dates: read the dates, one format at a time"
    - "tidy_text: work on a copy, then tidy the text"
    - "read_dates: put parse_dates to work on the joined column"
    - "make_numbers: make the numbers numbers"
    - "drop_impossible: throw out the impossible"
    - "drop_duplicates: drop the duplicates, last"
    - "clean_register: hand the table to each step in PIPELINE, in turn"
  shape: |
    def parse_dates(column):
        dates = pd.to_datetime(column, format=DATE_FORMATS[0], errors="coerce")
        for date_format in DATE_FORMATS[1:]:
            dates = dates.___(pd.to_datetime(column, format=___, errors="coerce"))
        return dates


    def tidy_text(register):
        clean = register.___()
        clean["name"] = clean["name"].str.___().str.___()
        clean["parish"] = ___
        return clean


    def make_numbers(register):
        clean = register.copy()
        clean["age"] = pd.to_numeric(clean["age"], errors=___)
        clean["launches"] = pd.to_numeric(clean["launches"].replace(___, ___))
        return clean


    def clean_register(raw):
        register = raw
        for step in ___:
            register = ___
        return register
---
Write the pipeline: `parse_dates`, the five steps and `clean_register`. `PIPELINE` and the report are written. The comments are Moss's steps from his ledger, now one function each.

```
Read register.csv: 133 rows, 13 values missing
  tidy_text        133 rows, 13 values missing
  read_dates       133 rows, 13 values missing
  make_numbers     133 rows, 21 values missing
  drop_impossible  133 rows, 22 values missing
  drop_duplicates  128 rows, 21 values missing
Saved register_clean.csv
```

Each step takes a table and gives back a new one, so each can be checked, and swapped, on its own. `pd.to_numeric(column, errors="coerce")` turns anything it can't read, like `unknown`, into `NaN`.

Don't be tempted by `format="mixed"`: it guesses, and in this register it guesses some dates wrong. The checks include dates like `06/10/1987`, where a guess goes badly. They also run every step on a small register of their own, and make sure nothing you're given gets written on.
