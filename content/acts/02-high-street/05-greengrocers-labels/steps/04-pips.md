---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Sanjay's reorder list. Only the things running low. One line."
  - pip: "It says it expected an else. I don't want an else. I want fewer things."
dialogue_after:
  - pip: "So the front if picks what to write, and the end if picks what to keep. Typical."
hints:
  nudge: "Pip wants to keep only some items. Where does an `if` go when it decides which items get in?"
  plan:
    - Read where the SyntaxError points
    - Decide whether this if chooses a value or keeps some items
    - Move the if to the end
  shape: |
    reorder = [name for name, price, count in stock ___ count < 10]
---
Run Pip's line and read the error. Fix it so it prints:

```
Reorder: pears, leeks, kale
```

Keep it a comprehension. The fix is moving one word, not adding more.
