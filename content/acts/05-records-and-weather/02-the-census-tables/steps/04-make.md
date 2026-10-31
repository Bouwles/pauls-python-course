---
id: make
type: make
title: Make the census answers
timeout_ms: 20000
on_pass: { aaesha: "Eighteen on the Hill in 1951. Counted by hand, that took me an afternoon." }
hints:
  nudge: "Every function starts by keeping one year's rows. What goes inside `census[...]` for that, and how do you add a second condition?"
  plan:
    - Keep the rows where the year matches
    - Add a second condition with &, brackets round each one
    - Count the rows that are left
    - Pick out the columns you need, then sort oldest first
    - Take the first name by position
    - Count each parish with value_counts
  shape: |
    def census_year(census, year):
        return census[census["year"] == ___]


    def parish_count(census, year, parish):
        rows = census[(census["year"] == year) ___ (census["parish"] == parish)]
        return ___(rows)


    def trade(census, year, occupation):
        rows = census[(census["year"] == year) & (census["occupation"] == occupation)]
        return rows[[___, ___, ___]].sort_values(___, ascending=False)


    def oldest(census, year):
        people = census_year(census, year).sort_values("age", ascending=False)
        return people["name"].___[0]


    def parish_sizes(census, year):
        return census_year(census, year)["parish"].___()
---
Write Aaesha's five functions. Loading the file and the report are done.

```
Census of 1951: 98 people
By parish: Bankside 35, Church Street 31, Hill 18, Northgate 14
On the Hill: 18
Fishermen: 6
Oldest of all: Walter Rook
```

Two you'll want:

- `table.sort_values("age", ascending=False)` gives back a copy of `table`, oldest first.
- `table["parish"].value_counts()` counts each different value in the column, largest first, as a Series.

The checks also hand your functions a smaller census of their own, and ask about 1941. There was no census in 1941.
