---
id: make
type: make
title: Make the rainfall report
on_pass: { ashby: "Twenty-five unusual months. I'd have guessed nine. I'd have been wrong for forty years." }
hints:
  nudge: "Which axis disappears to leave one number per year? And what shape do you get from `rain - monthly_means(rain)`?"
  plan:
    - Add up each row, for one number per year
    - Average each column, for one number per month
    - Take the averages off every row at once
    - Find the position of the biggest total, then the year at that position
    - Mark the months beyond the limit either way, then count the marks
  shape: |
    def yearly_totals(rain):
        return rain.sum(axis=___)


    def monthly_means(rain):
        return rain.___(axis=0)


    def anomalies(rain):
        return rain - ___


    def wettest_year(years, rain):
        return int(years[yearly_totals(rain).___()])


    def count_unusual(rain, limit):
        unusual = np.___(anomalies(rain)) > limit
        return int(unusual.___())
---
Write Mr Ashby's five functions. Penhallow's loader and the report are done.

```
100 years, 1200 months
Wettest year: 1960 (1439.0 mm)
Average by month: [116  84  81  58  54  55  60  72  78 112 123 127]
Months more than 60 mm from normal: 25
```

Three things you haven't met yet:

- `totals.argmax()` gives the position of the biggest number in `totals`. The same position in `years` holds its year.
- `np.abs(a)` makes every number in `a` positive.
- A comparison like `a > 60` gives an array of `True` and `False`. `True` counts as 1 when you `.sum()` it.

The checks try arrays other than Ashby's, and look for loops. There shouldn't be any.
