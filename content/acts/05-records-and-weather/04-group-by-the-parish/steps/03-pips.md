---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya.pleased.wave: "Can you look at mine? Household sizes, for the wall chart. Twelve people to a house, on average."
  - riya.confused: "I tried it on 1921 alone and it was fine. All four censuses, and eighteen in the biggest."
dialogue_after:
  - riya.laughing: "Household 2 in 1921 and household 2 in 2011. Different families, same number. I'd moved them in together."
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
Yahya wants to know how big the households were, for the wall chart. Riya wrote three functions. They run, and they give an answer.

The enumerators numbered the households in each census as they walked round: 1, 2, 3 and so on, starting again every time.

Run it, look at the first line it prints, and fix it.
