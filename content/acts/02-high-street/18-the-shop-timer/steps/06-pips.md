---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "I've done Sanjay's timer already. Wrapper, clock, log. Textbook."
  - pip: "The log's perfect. Then label crashes on a None. Where did a None come from."
dialogue_after:
  - pip: "So the wrapper has to pass the answer back. It's a middleman. Middlemen forget things."
hints:
  nudge: "After the decorator, calling `weigh` runs `wrapper`. What does `wrapper` give back?"
  plan:
    - Read the traceback and find which value is None
    - Follow it back to the call that made it
    - Keep the real function's result and hand it back after logging
  shape: |
    def wrapper(*args, **kwargs):
        start = clock()
        result = func(*args, **kwargs)
        log.append((func.__name__, clock() - start))
        ___
---
Pip's `timed` logs every call. Run it and read the traceback from the bottom.

Fix the decorator, not Sanjay's functions. It should print:

```
Plums: £3.15
2 calls logged
```
