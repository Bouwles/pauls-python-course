---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya.proud: "I've already done a timer for Caitlin's till with a wrapper, a clock and a log, all by the book."
  - riya.confused: "The log's perfect, but then label crashes on a None. Something's off, can you look?"
dialogue_after:
  - riya.laughing: "So the wrapper has to pass the answer back, like a middleman, and middlemen forget things."
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
Riya's `timed` logs every call. Run it and read the traceback from the bottom.

Fix the decorator, not the till's functions. It should print:

```
Plums: £3.15
2 calls logged
```
