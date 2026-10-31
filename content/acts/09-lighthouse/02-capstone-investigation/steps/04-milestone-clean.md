---
id: cleaned-and-checked
type: milestone
title: "Milestone 2: the cleaned data, checked"
evidence: none
dialogue:
  - aaesha: "Next month the Met Office adds a row, and changes a provisional one. Will your checks notice?"
checklist:
  - id: own-tests
    text: "test_station.py has at least five tests of your own, and they all pass when investigation.py runs them."
    why: "The Make's checks were mine. Yours are the ones that know what your question needs."
  - id: gaps
    text: "You've counted the gaps in every column you use, in the years you use, and printed the counts."
    why: "Gaps are part of the answer. Count them before they count against you."
  - id: part-years
    text: "Years with a missing month are left out of yearly figures, never filled in or added up short."
    why: "Eleven months of rain is a dry year that never happened."
  - id: sensor
    text: "If you use sunshine, you've checked what changes in September 2002, when the sensor takes over."
    why: "A new instrument can make a town duller overnight. Compare like with like, or say plainly that you can't."
  - id: provisional
    text: "Provisional months are left out, or kept and named wherever they appear."
    why: "Provisional means the Met Office haven't finished checking. That's a reason to be careful, not to look away."
  - id: written-down
    text: "Every cleaning step is a function or a line of code, not something done by hand."
    why: "If it isn't written down, it can't be checked, and it can't be done again next month."
---
The Make checked the loading. Now check what your question needs.

If you compare decades, are they complete? If you use sunshine, which instrument measured it? If a provisional month falls inside your years, what will you do with it, and does the answer change if you do the other thing?

Write each check as a test in `test_station.py`, so it runs every time you press Run. A check done once by eye won't stop next month's file, with one more row and a corrected one, from fooling you.

When a test fails, decide which is wrong, the data or your idea of it, before you change either.
