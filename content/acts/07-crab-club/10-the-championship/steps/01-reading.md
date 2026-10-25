---
id: rules
type: reading
title: Race-day rules
dialogue:
  - committee: "The stewards lay out the course at dawn. Nobody sees it before."
  - committee: "Not the crabs. Not the committees. Not..."
  - committee: "...the stewards' wives."
  - moss: "So a crab who knows one course is no use. He has to learn whichever one he's given."
---
Every crab so far has learned one track. In the Championship the track is new every time, so what you build isn't a policy but a way of finding one: an agent that practises on a strange course and comes away racing it well.

Build it in three files, each with its own checks:

```text
course.py     the committee's rules: courses, moves, slips, races, practice
crab.py       Sir Reginald: practises, then hands back a policy
race_day.py   baselines, a table of results, and an entry for the Crab League
```

Try ideas out on courses from a handful of seeds. Keep other seeds back and race them only at the end: a crab tuned on the test course has simply had extra practice on it. The checks go one further, with seeds you never see.

Last comes the committee's race-day checklist.
