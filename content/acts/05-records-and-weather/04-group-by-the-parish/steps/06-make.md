---
id: make
type: make
title: Make the council's tables
timeout_ms: 20000
on_pass: { ashby: "Seventeen at sea in 1921, eleven in 2011. The council will want that on one page." }
hints:
  nudge: "Which pandas call puts one thing down the side, another across the top, and a count in every cell? And how many cards should each occupation match?"
  plan:
    - Count each parish in each year, as a grid with 0 for nobody
    - Group by year and name each summary with agg
    - Work out people per household from two of those columns
    - Keep one card per occupation
    - Merge with how="left" so nobody is dropped
    - Fill the gaps with "unlisted"
    - Count each sector in each year, the same way as the parishes
  shape: |
    def parish_table(census):
        return census.pivot_table(index=___, columns=___, aggfunc="size", fill_value=___)


    def year_summary(census):
        summary = census.groupby("year").agg(
            people=("name", "size"),
            households=("household", ___),
            average_age=(___, ___),
        )
        summary["per_household"] = ___
        return summary


    def with_sectors(census, trades):
        cards = trades.___("occupation")
        people = census.merge(cards, on=___, how=___)
        people["sector"] = people["sector"].___("unlisted")
        return people
---
Write the four functions. Loading the files and the report are done.

```
By census
      people  households  average_age  per_household
year
1921      90          23         27.1            3.9
1951      98          26         25.3            3.8
1981      63          26         39.5            2.4
2011      68          26         33.2            2.6
```

The run prints a table of parishes and one of sectors too. You'll want:

- `pivot_table(..., aggfunc="size", fill_value=0)`: counts the rows in each cell, and puts 0 where there's nobody.
- `"nunique"` in `agg`: how many different values a column has in each group.
- `trades.drop_duplicates("occupation")`: a copy keeping the first card for each occupation.
- `column.fillna("unlisted")`: fills the gaps a left merge leaves.

The checks give your functions a smaller census and index too. One of its cards is in twice.
