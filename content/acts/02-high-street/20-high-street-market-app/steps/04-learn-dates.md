---
id: learn-dates
type: learn
title: Days, not moments
concept: standard-library
code: |
  from datetime import date

  pasty = date(2026, 11, 22)
  print(pasty.year, pasty.month, pasty.day)
  print(pasty.isoformat())
  print(date.fromisoformat("2026-11-03") < pasty)
  print(sorted([pasty, date(2026, 10, 30)]))
---
`date`, from the same `datetime` module as Caitlin's opening hours, is a day with no time: `date(2026, 11, 22)`. Every transaction in her app happens on a day.

`.year`, `.month` and `.day` pick it apart. Dates compare and sort in time order, earliest first.

JSON has no dates, so the money file keeps each one as text. `pasty.isoformat()` writes it as `2026-11-22`, and `date.fromisoformat("2026-11-22")` reads it back. The example prints `2026 11 22`, then `2026-11-22`, `True`, and the two dates in order.

The usual slip is to find a month by `.month` alone. Every November has month 11, last year's too. Check the `.year` as well.
