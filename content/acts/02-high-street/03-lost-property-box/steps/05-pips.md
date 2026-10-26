---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Mrs Vance wants to know what was handed in more than once. I've used sets."
  - pip: "Curly brackets make a set. Everyone knows that. So why does it say dict."
dialogue_after:
  - pip: "Empty curly brackets are a dict. Dictionaries got there first, apparently. Who decided that."
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
Pip's `repeats` should give back the items handed in more than once. Run it, read the traceback, and fix it so it prints:

```
['red scarf', 'umbrella']
```
