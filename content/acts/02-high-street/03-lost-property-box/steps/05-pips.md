---
id: pips
type: pips
title: Fix Aaesha's version
dialogue:
  - aaesha: "Neil wants to know what was handed in more than once. Sets, naturally. No duplicates."
  - aaesha: "Curly brackets make a set. So why does it say dict? Can you look?"
dialogue_after:
  - aaesha: "Empty curly brackets are a dict. Dictionaries got there first. Noted, and filed."
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
Aaesha's `repeats` should give back the items handed in more than once. Run it, read the traceback, and fix it so it prints:

```
['red scarf', 'umbrella']
```
