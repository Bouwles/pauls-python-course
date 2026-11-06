---
id: make
type: make
title: Make the log streamer
files: [logstream.py]
entry: logstream.py
argv_field: true
timeout_ms: 15000
on_pass: { neil.proud: "Three brake errors before hour eight, and it read that far and stopped. Sensible program." }
hints:
  nudge: "Which function stops the whole chain early, and how does it tell the others to stop?"
  plan:
    - Read the lines one at a time
    - Skip the notes, and the blank lines
    - Turn each line into a tuple and hand it over
    - Pass on only what's needed, as it's asked for
    - Take no more than you need
    - Chain them, and loop over the end of the chain
  shape: |
    def read_lines(path):
        with open(path) as log:
            for line in log:
                line = line.rstrip("\n")
                if line.strip():
                    ___ line


    def matching(entries, level=None, system=None):
        for entry in entries:
            time, entry_level, entry_system, message = entry
            if level is not None and entry_level != ___:
                continue
            if system is not None and entry_system != system:
                continue
            ___ entry


    def first(entries, count):
        found = []
        if count <= 0:
            return found
        for entry in entries:
            found.append(entry)
            if len(found) == ___:
                ___
        return found
---
Write the four functions in `logstream.py`, then chain them in `main`. In the Arguments box, try `--level ERROR --system brakes --first 3`:

```
06:12 ERROR brakes: overheating
06:37 ERROR brakes: overheating
07:57 ERROR brakes: overheating
```

`race.log` here is one race, 1,451 lines. Neil's whole log is years long. Nothing in your chain should care.

The checks hand your functions a log that never ends and count how much they read. A generator copes with that. A list doesn't.
