---
id: write-up
type: milestone
title: "Milestone: Yahya's checklist"
evidence: none
dialogue:
  - yahya.neutral.point: "My checklist. I use it on my own reports too. Especially on those."
  - paul.laughing: "Tick only what's true. He'll read it."
checklist:
  - id: axes
    text: "Every chart's scale is honest: the rain from zero, and the temperature drawn as a difference from an average the chart names."
    why: "A scale that starts in the wrong place makes a small change look like a cliff. Yahya won't pin up a cliff that isn't there."
  - id: units
    text: "Every number in the report, and every axis, says its units: degrees C, mm, hours."
    why: "0.86 of what. A number without a unit is a guess at what someone meant."
  - id: sources
    text: "The report and every chart say where the numbers came from, and the conclusion says what was done to them: Fahrenheit converted, duplicates dropped, five years of sunshine missing."
    why: "Anyone checking your work starts where you started. Tell them where that was, and what you changed on the way."
  - id: uncertainty
    text: "Every claim of a change comes with its p, and the conclusion says in words what the p means."
    why: "p under 0.001 and p of 0.21 are different sentences. Readers deserve to know which one they're reading."
  - id: no-change
    text: "Where the record shows no clear change, the conclusion says so, plainly, instead of leaving it out."
    why: "A finding of nothing is still a finding. Leave it out, and someone will fill the gap with a story."
  - id: limits
    text: "The conclusion claims no more than one station can show: what changed at the Clocktower, not why."
    why: "One gauge on one building. It's a good gauge. It isn't the world."
  - id: aloud
    text: "You've read the conclusion aloud, start to finish, and it makes sense without the charts."
    why: "Most people will read the words and glance at the pictures. Yahya reads it out to the whole class, and not all of them are patient."
---
The report runs and the numbers are right. Now Yahya reads it the way a stranger would.

Go back to `report.py` in the last step and read its output from the top, then look at each chart. Go through Yahya's list one line at a time. Where something isn't true yet, fix the report first, then tick it.

Caitlin's draft broke most of these. Most first drafts break two or three: usually units, and the thing that didn't change.
