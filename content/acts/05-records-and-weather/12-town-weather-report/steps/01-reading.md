---
id: plan
type: reading
title: Mark it out first
dialogue:
  - moss: "Four pieces. Each does one job, and you can check each without the others."
  - priya: "And the last piece is words. The numbers are for the words."
---
A report this size goes in four files, built in this order:

```
station.py   reading and cleaning the ledger     imports nothing of yours
summary.py   the numbers                         imports station
charts.py    the pictures                        imports nothing of yours
report.py    what it all means                   imports all three
```

Each file starts with its requirements, exactly as the checks read them: the names, what goes in and what comes back. There's no starter code beyond that. Everything you've done this Act is in here somewhere: cleaning, grouping, honest charts, shuffling.

`summary.py` and `charts.py` never read a file or print. They take tables and give back numbers or figures, which is why they can be checked on small tables of the checks' own.

The files you've written come with you into each step. If a later step turns up a bug in an earlier file, fix it there.

Last of all, Priya reads the write-up against her checklist.
