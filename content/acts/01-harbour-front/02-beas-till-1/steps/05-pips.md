---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "I did Bea's till. Mine says ten point six pounds and sixty pence."
  - pip: "Which is correct. Mostly."
dialogue_after:
  - pip: "So she'd have been paid the sixty pence twice. Bea would have noticed."
hints:
  nudge: "Pip divides with `/`. What does `/` do with the 60 pence?"
  plan:
    - Find the line that works out the pounds
    - Use the division that drops the remainder
    - Rename each variable for what it holds
  shape: |
    loaves = 3
    buns = 4
    total = loaves * 240 + buns * 85
    pounds = total ___ 100
    pence = total % 100
    print(total)
    print(pounds, "pounds", pence, "pence")
---
Run Pip's program. The second line should say `10 pounds 60 pence`.

Fix it. While you're in there, give the variables honest names. Moss won't accept `a` to `e`.
