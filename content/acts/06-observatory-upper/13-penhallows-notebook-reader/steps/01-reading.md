---
id: plan
type: reading
title: Mark it out first
dialogue:
  - moss: "Four files, each with one job. Mark them out before you cut."
---
The reader is four files, built in this order. Each step adds one, and the files you've already written come with you. If a later step shows up a bug in an earlier file, fix it there.

```
notes.py      the notes as numbers         imports nothing of yours
baseline.py   the scores to beat           imports notes
model.py      the network, and training    imports notes and baseline
reader.py     finishing a note             imports notes and model
```

`notes.txt` holds 85 of Penhallow's notes, one a line: the ones you've found in the town's code, and more that Wendt copied from her notebooks.

Every fifth note is held back, whole. Hold back characters at random instead, and the model would learn the first half of a sentence and be tested on the second: the bottom drawer again, with a hole in it.

Each starter is almost empty: a docstring listing what to write. The checks use the names and arguments exactly as it gives them.
