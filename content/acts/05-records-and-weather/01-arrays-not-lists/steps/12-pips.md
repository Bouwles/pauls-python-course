---
id: pips
type: pips
title: Fix Aaesha's version
dialogue:
  - aaesha.pleased.wave: "Can you look at mine? I wrote the checks first, like always. Then the code."
  - aaesha.confused: "The code looks right to me. The check says it isn't. Something's off."
dialogue_after:
  - aaesha.surprised: "Three hundred and fifty-nine. I typed my own check wrong. The code was fine all along."
  - aaesha.thinking: "So a failing check means something's wrong. Not always the code."
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
Aaesha has had a go at Yahya's grade book: an average for each student and an average for each assessment, with her checks under them, written first.

Run it. Before you change a thing, work out what shape each function should give back, from the axis that disappears. Then fix whichever is wrong: the code, or the check.
