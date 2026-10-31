---
id: where-it-came-from
type: reading
title: Where the numbers came from
dialogue:
  - aaesha: "Before the numbers, the notes above them. Somebody wrote those for a reason."
---
Open `stornowaydata.txt` and read the top before the table. A data file's notes are part of its data: five lines about the station and its marks, two of column names and units, then one row per month.

Four marks change what a number means. `*`: estimated, worked out from the surrounding stations rather than measured here. `---`: missing. `#`: sunshine from the automatic sensor; before September 2002, a glass ball burnt a line on a card. `Provisional`: not yet fully checked.

Take the marks off and forget them, and an estimate looks like a measurement and two instruments look like one. So keep them, as a True or False column each, beside the numbers.

A dataset's **provenance** is where it came from and what happened to it on the way: who measured it, how, where, when it was downloaded, and under what licence. `SOURCE.md` is this one's.
