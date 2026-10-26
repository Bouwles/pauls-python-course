---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "The housing committee wanted household sizes. Twelve people to a house, on average."
  - pip: "{{town}} must have been cosy. Eighteen in the biggest. I've checked the code twice."
dialogue_after:
  - pip: "Household 2 in 1921 and household 2 in 2011. Different families, same number. I'd made them share a house."
hints:
  nudge: "Is household 1 in 1921 the same household as household 1 in 2011?"
  plan:
    - Run it and look at how many households it finds
    - Work out what makes a household different from every other one
    - Group by everything that does
  shape: |
    def household_sizes(census):
        return census.groupby([___, ___]).size()
---
The council's housing committee asked how big {{town}}'s households were. Pip wrote three functions. They run, and they give an answer.

The enumerators numbered the households in each census as they walked round: 1, 2, 3 and so on, starting again every time.

Run it, look at the first line it prints, and fix it.
