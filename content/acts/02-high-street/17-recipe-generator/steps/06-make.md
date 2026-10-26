---
id: make
type: make
title: Make the log streamer
files: [logstream.py]
entry: logstream.py
argv_field: true
timeout_ms: 15000
on_pass: { moss: "Three fog horn errors before eight, and it read as far as eight and stopped. Sensible machine." }
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


    def matching(entries, level=None, machine=None):
        for entry in entries:
            time, entry_level, entry_machine, message = entry
            if level is not None and entry_level != ___:
                continue
            if machine is not None and entry_machine != machine:
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
Write the four functions in `logstream.py`, then chain them in `main`. In the Arguments box, try `--level ERROR --machine fog-horn --first 3`:

```
06:12 ERROR fog-horn: no air pressure
06:37 ERROR fog-horn: no air pressure
07:57 ERROR fog-horn: no air pressure
```

`machines.log` here is one day, 1,451 lines. The real one is years long. Nothing in your chain should care.

The checks hand your functions a log that never ends and count how much they read. A generator copes with that. A list doesn't.
