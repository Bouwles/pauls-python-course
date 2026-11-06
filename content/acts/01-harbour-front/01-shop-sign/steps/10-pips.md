---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin.pleased: "I made a sign for the arcade cabinet upstairs. Took me two minutes."
  - caitlin.confused.point: "It says unterminated string. I terminated it. Look, there's a quote right there."
dialogue_after:
  - caitlin.laughing.thumbs: "Oh. They have to match. Fine. It works, it's ugly, I'm shipping it."
hints:
  nudge: "Look at line 2. Which kind of quote opens the text, and which kind closes it?"
  plan:
    - Find the line the error points at
    - Check the quote at each end of the text
    - Make the outside quotes match, without breaking the apostrophe in Caitlin's
  shape: |
    print("ARCADE CABINET")
    print(___Beat Caitlin's high score___)
    print("Two goes each")
---
Caitlin's sign has one mistake. Run it: nothing prints, not even line 1, because Python reads the whole file before it runs any of it, and it can't read line 2.

The error says the string is *unterminated*: it starts, but Python never finds the quote that ends it. Fix it so the program prints:

```text
ARCADE CABINET
Beat Caitlin's high score
Two goes each
```
