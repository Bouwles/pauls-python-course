---
id: pips
type: pips
title: Fix Aaesha's version
dialogue:
  - aaesha: "Can you look at mine? I wrote the checks first, like always. Then the code."
  - aaesha: "The code looks right to me. The check says it isn't. Something's off."
dialogue_after:
  - aaesha: "Three hundred and fifty-nine. I typed my own check wrong. The code was fine all along."
  - aaesha: "So a failing check means something's wrong. Not always the code."
hints:
  nudge: "How many students are there, so how many numbers should `student_means` give back? Is it the code or the check that disagrees with that?"
  plan:
    - Run it and read the AssertionError
    - Work out the shape each function should give, from the axis that disappears
    - Fix whichever is wrong, the code or the check, and keep both checks
  shape: |
    assert student_means(marks).shape == (___,), "one average for each student"
    assert assessment_means(marks).shape == (___,), "one average for each assessment"
---
Aaesha has started on the grade book: an average for each student and an average for each assessment, with her checks under them, written first.

`axis=0` runs down the rows, across all the students. `axis=1` runs along each row, across one student's three marks. Whichever axis you name gets averaged away and disappears.

Run it. Before you change a thing, work out what shape each function should give back. Then fix whichever is wrong: the code, or the check.
