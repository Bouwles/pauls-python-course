---
id: make
type: make
title: Make the wall chart's tables
timeout_ms: 20000
on_pass: { yahya.proud.cheer: "Seventeen at sea in 1921, eleven in 2011. That goes on the wall chart, bars from zero." }
hints:
  nudge: "Which pandas call puts one thing down the side, another across the top, and a count in every cell? And how many cards should each occupation match?"
  plan:
    - "parish_table: count each group in a grid, 0 where there's nobody"
    - "year_summary: group, and name each summary with agg"
    - Work out a new column from two summaries
    - "with_sectors: keep one card per key"
    - Merge with how="left" so nobody is dropped
    - Fill the gaps with "unlisted"
    - "sector_table: count each group in a grid, the same way as the parishes"
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

The run prints a table of parishes and one of sectors too. Each function is one of Paul's tea round functions, with the census for the cups, and his labels are in your file. `sector_table` can start from `with_sectors`.

The checks give your functions a smaller census and index too. One of its cards is in twice.
