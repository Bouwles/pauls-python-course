---
id: load-the-station
type: make
title: Load the station
files: [investigation.py, station.py, test_station.py]
entry: investigation.py
timeout_ms: 30000
on_pass: { yahya.pleased: "Four estimates, nine provisional months, 668 without sunshine. Now we know what we're standing on." }
hints:
  nudge: "Which line tells you where the table starts? And what do you need to write down about a value before you take its mark off?"
  plan:
    - Find the line that starts with yyyy
    - Read the table as text, one row per month
    - Note the marks before taking them off
    - Turn the text into numbers, with honest names
    - Label the rows 0, 1, 2 and so on
    - Add up only the complete years
  shape: |
    def clean_column(texts):
        return pd.to_numeric(texts.str.___("*#").replace("---", ___)).astype(float)


    def load_station(path):
        with open(path) as station_file:
            lines = station_file.read().splitlines()
        header = next(i for i, line in enumerate(lines) if line.split()[:1] == [___])
        rows = [line.split() for line in lines[___:] if line.strip()]
        # each row: seven fields, then perhaps "Provisional"
        ...
        station["estimated"] = raw[MEASURES].apply(lambda column: column.str.endswith(___)).any(axis=___)


    def annual_rain(station):
        return station.groupby(___)["rain"].sum(min_count=___)
---
Write `clean_column`, `load_station` and `annual_rain` in `station.py`; the agreed table is described at its top. Pressing Run runs `investigation.py`, where your analysis will go: first your own tests in `test_station.py`, through pytest, then whatever you write.

```text
>>> station.shape
(1839, 10)
```

Most rows have seven fields; a few have `Provisional` after the sunshine. Read the table as text, note the marks, and only then make numbers.

`annual_rain` is the first honesty test. pandas' `sum()` skips gaps, so a year with a missing month would come out as a dry year. `sum(min_count=12)` refuses to add up fewer than twelve.

The checks load Stornoway, then two smaller files from other stations, whose notes run to more lines and to fewer.
