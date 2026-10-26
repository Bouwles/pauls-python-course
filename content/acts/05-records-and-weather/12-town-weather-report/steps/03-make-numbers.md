---
id: make-numbers
type: make
title: The numbers
files: [station.py, summary.py]
entry: summary.py
starter_from: make-clean
timeout_ms: 30000
dialogue:
  - priya: "Every number in the report comes from here. Including the ones that say nothing happened."
on_pass: { priya: "Warmer, p under a thousandth. Wetter, p of a fifth. One finding and one shrug, and both are true." }
hints:
  nudge: "What does a year's total mean if one month is missing? And for `compare`, what do you count on each shuffle?"
  plan:
    - Group by year, with sum(min_count=12) for the totals and a count for the mean
    - Group the years by their decade, years // 10 * 10
    - Keep the years first to last, then group by month
    - Drop the missing years, then fit a straight line and take its slope
    - Find the real difference, then shuffle the years together many times
    - Count the shuffles at least as far from 0, either way, and divide
  shape: |
    def yearly(station):
        by_year = station.groupby("year")
        return by_year.agg(
            temp=("temp", lambda temps: temps.mean() if temps.count() == ___ else np.nan),
            rain=("rain", lambda rain: rain.sum(min_count=___)),
            sun=___,
        )


    def compare(years, column, early, late, shuffles=5000, seed=0):
        first = years[column].loc[early[0]:early[1]].dropna().to_numpy()
        second = ___
        difference = ___
        rng = np.random.default_rng(seed)
        both = np.concatenate([first, second])
        as_far = 0
        for _ in range(shuffles):
            shuffled = rng.permutation(both)
            ...
        return difference, as_far / shuffles
---
`summary.py` works out every number the report will print. Your `station.py` comes with you.

`compare` is the permutation test from Is It Really Warmer, counted either way, as in its stretch: the report doesn't assume which way the weather moved. If the years were just shuffled, how often would two groups of them differ by as much as the early and late thirty really do? Rarely means the difference is real. Often means it could be chance.

`.loc[1925:1954]` on a table labelled by year keeps 1925 to 1954, both included. `np.polyfit(x, y, 1)` fits a straight line and gives back its slope, then its intercept.

The hidden checks try a year with a month missing, six years whose p is known exactly, and the same seed twice.
