---
id: rules
type: reading
title: Race-day rules
dialogue:
  - caitlin.neutral.point: "The final's course is made that morning, from a seed. Nobody sees it before."
  - caitlin.laughing: "Not you. Not Yahya. Not even me, and I wrote the generator."
  - paul.thinking: "So a crab that knows one course is no use. It has to learn whichever one it's given."
---
Every crab so far learned one track. In the final the track is new every time, made from a seed that morning. So you're not building a policy: you're building a crab that practises on a strange course and comes away racing it well.

You build it in three files, each with its own checks:

```text
course.py     the League's rules: courses, moves, slips, races, practice
crab.py       the crab: practises, then hands back a policy
race_day.py   baselines, a table of results, and an entry for the Arcade League
```

Try your ideas on courses from a few **training** seeds. Keep other **testing** seeds back and race them once, at the end, as with a test set in the Model Room: a crab tuned on its test course has simply had extra practice. The checks go further, with seeds you never see.

Done is all three checks passing, then Aaesha's race-day checklist, ticked honestly.
