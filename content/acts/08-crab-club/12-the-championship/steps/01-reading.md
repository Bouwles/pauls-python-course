---
id: rules
type: reading
title: Race-day rules
dialogue:
  - yahya: "The final's course is made that morning, from a seed. Nobody sees it before."
  - yahya: "Not you. Not me. Not even Caitlin, and she wrote the generator."
  - paul: "So a crab that knows one course is no use. It has to learn whichever one it's given."
---
Every crab so far has learned one track. In the final the track is new every time, so what you build isn't a policy but a way of finding one: an agent that practises on a strange course and comes away racing it well.

Build it in three files, each with its own checks:

```text
course.py     the League's rules: courses, moves, slips, races, practice
crab.py       the crab: practises, then hands back a policy
race_day.py   baselines, a table of results, and an entry for the Arcade League
```

Try ideas out on courses from a handful of seeds. Keep other seeds back and race them only at the end: a crab tuned on the test course has simply had extra practice on it. The checks go one further, with seeds you never see.

Last comes Yahya's race-day checklist.
