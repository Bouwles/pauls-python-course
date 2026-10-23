---
id: make
type: make
title: Make the register clean
timeout_ms: 20000
on_pass: { ashby: "Peter Jago, once. Helen Rowe, once. My grandfather, once. Nobody aged 412." }
hints:
  nudge: "What has to happen to `\"HARBOUR \"` and `\"harbour\"` before `drop_duplicates()` can see they're the same parish?"
  plan:
    - Work on a copy
    - Tidy the text
    - Read the dates, one format at a time
    - Make the numbers numbers
    - Throw out the impossible
    - Drop the duplicates, last
  shape: |
    def parse_dates(column):
        dates = pd.to_datetime(column, format=DATE_FORMATS[0], errors="coerce")
        for date_format in DATE_FORMATS[1:]:
            dates = dates.___(pd.to_datetime(column, format=___, errors="coerce"))
        return dates


    def clean_register(raw):
        clean = raw.___()
        clean["name"] = clean["name"].str.___().str.___()
        clean["parish"] = ___
        clean["joined"] = parse_dates(___)
        clean["age"] = pd.to_numeric(clean["age"], errors=___)
        clean["launches"] = pd.to_numeric(clean["launches"].replace(___, ___))
        clean.loc[___, "age"] = np.nan
        return clean.___().reset_index(drop=True)
---
Write `parse_dates` and `clean_register`. The comments in `clean_register` are Moss's steps from his ledger, in his order.

```
Crew on the register: 128
Joined from 1925 to 2023
Ages known for 108; average age on joining: 26.5
Most launches: Walter Kerrow, 251
```

`pd.to_numeric(column, errors="coerce")` turns anything it can't read, like `unknown`, into `NaN`.

Don't be tempted by `format="mixed"`: it guesses, and in this register it guesses some dates wrong. The checks include dates like `06/10/1987`, where a guess goes badly.

The checks also clean a small register of their own, and make sure the raw table comes back untouched.
