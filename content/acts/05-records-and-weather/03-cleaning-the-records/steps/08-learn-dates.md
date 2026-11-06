---
id: learn-dates
type: learn
title: Dates written three ways
concept: data-cleaning
code: |
  import pandas as pd

  joined = pd.Series(["1960-01-09", "09/01/1960", "9 Jan 1960"])
  iso = pd.to_datetime(joined, format="%Y-%m-%d", errors="coerce")
  slashed = pd.to_datetime(joined, format="%d/%m/%Y", errors="coerce")
  written = pd.to_datetime(joined, format="%d %b %Y", errors="coerce")
  print(iso.isna().sum())

  dates = iso.fillna(slashed).fillna(written)
  print(dates.isna().sum())
  print(dates.dt.year.tolist())
---
`pd.to_datetime(column, format="%d/%m/%Y")` reads text dates written one way into real dates, which sort and compare properly. In a format, `%d` is the day, `%m` the month as a number, `%b` a short month name like `Jan`, and `%Y` the year. With `errors="coerce"`, a date it can't read becomes `NaT`, "not a time".

The register's dates are written three ways, so read the column once per format. `first.fillna(second)` keeps `first` where it has a date and takes `second` where it doesn't. `.dt.year` gives each date's year.

The example prints `2`, `0`, then `[1960, 1960, 1960]`.

The usual slip is to let pandas guess. Here `06/10/1987` is 6 October; a guess may read 10 June.
