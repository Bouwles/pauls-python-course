---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "No loops anywhere. I made it fast first. That's the right order, isn't it."
  - pip: "A hundred years of rain and twelve yearly totals. Ashby will want the other eighty-eight."
dialogue_after:
  - pip: "So the axis you name is the one that goes. I had both of them backwards. Consistent, at least."
hints:
  nudge: "Which axis has to disappear to leave one number per year: the rows, or the columns?"
  plan:
    - Run it and read the two shapes
    - Work out which axis each function should collapse
    - Swap the axes
  shape: |
    def yearly_totals(rain):
        return rain.sum(axis=___)


    def monthly_means(rain):
        return rain.mean(axis=___)
---
Pip has started on Mr Ashby's report: a total for each year and an average for each month.

`axis=0` runs down the rows, across all the years. `axis=1` runs along each row, across the twelve months. Whichever axis you name gets added up and disappears.

Run it, read the shapes, and fix it.
