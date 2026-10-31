---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya: "I've done a timer for my till already. Wrapper, clock, log. Textbook."
  - riya: "The log's perfect. Then label crashes on a None. Can you look? Something's off."
dialogue_after:
  - riya: "So the wrapper has to pass the answer back. It's a middleman. Middlemen forget things."
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
