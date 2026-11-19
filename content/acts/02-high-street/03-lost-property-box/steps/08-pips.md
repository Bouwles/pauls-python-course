---
id: pips
type: pips
title: Fix Aaesha's version
dialogue:
  - aaesha.pleased: "Caitlin wants to know what was handed in more than once, which is obviously a job for sets."
  - aaesha.confused: "Curly brackets make a set, don't they? Then why's it telling me it's a dict? Could you have a look?"
dialogue_after:
  - aaesha.laughing: "Ah, empty curly brackets are a dict because dictionaries got there first. I'm writing that down."
hints:
  nudge: "Read the last line of the traceback. What type does it say `seen` is?"
  plan:
    - Read the last line of the traceback
    - Work out what empty curly brackets make
    - Start both collections as empty sets
  shape: |
    seen = ___
    repeated = ___
---
Aaesha's `repeats` should give back the items handed in more than once. Run it and read the traceback.

Fix it so it prints:

```
['red scarf', 'umbrella']
```
