---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "I've done Bea's window sign. She hasn't seen it yet."
  - pip: "It says unterminated string. I terminated it. Look, there's a quote right there."
dialogue_after:
  - pip: "Oh. They have to match. Who decided that."
hints:
  nudge: "Look at line 2. Which kind of quote opens the text, and which kind closes it?"
  plan:
    - Find the line the error points at
    - Check the quote at each end of the text
    - Make the outside quotes match, without breaking the apostrophe in Bea's
  shape: |
    print("HOLLIS BAKERY")
    print(___Bread, buns and Bea's lardy cake___)
    print("Open from 7")
---
Run Pip's program and read the error. Then fix it so it prints Bea's sign:

```
HOLLIS BAKERY
Bread, buns and Bea's lardy cake
Open from 7
```
