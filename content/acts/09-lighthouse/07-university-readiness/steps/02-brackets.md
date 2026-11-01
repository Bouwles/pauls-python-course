---
id: brackets
type: make
title: "Question 1: The clock's lamp schedule"
files: [brackets.py]
entry: brackets.py
on_pass: { neil.pleased.thumbs: "Every bracket has its partner. The schedule loads, and the lamp comes on at dusk." }
hints:
  nudge: "When a closing bracket arrives, which opener must it match: the first one still open, or the most recent?"
  plan:
    - Keep a stack of the positions of brackets still open
    - "An opener: push its position"
    - "A closer: if nothing is open, or the top is the wrong kind, that's the problem"
    - Otherwise pop the opener it closes
    - "At the end: if anything is still open, the bottom of the stack is the earliest"
    - "Nothing wrong: -1"
  shape: |
    PARTNERS = {")": "(", "]": "[", "}": "{"}


    def first_error(text):
        still_open = []
        for position, character in enumerate(text):
            if character in "([{":
                still_open.___(position)
            elif character in PARTNERS:
                if not still_open or text[___] != PARTNERS[character]:
                    return ___
                still_open.___()
        if still_open:
            return ___
        return -1
---
The lamps behind the clock face run from a schedule written with brackets inside brackets. Before anyone loads a new one, something should check them.

Write `first_error(text)`. Only `()`, `[]` and `{}` matter; every other character is ignored. Read the text from left to right.

- The first closing bracket that has no opener, or closes the wrong kind, is the problem: return its position.
- If the text ends with brackets still open, return the position of the earliest one still open.
- Otherwise return `-1`.

**Limits:** `text` has up to 100,000 characters.

```
first_error("[lamp(on]")       gives 8    the ] at 8 would close the ( at 5
first_error("(dusk (dawn)")    gives 0    the ( at 0 is never closed
```
