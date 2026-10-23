---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Bea's Saturday orders. I sorted them for the baking sheet, so she can find names."
  - pip: "Now it says serve Mr Ashby first. Mrs Vance was here at seven."
dialogue_after:
  - pip: "So there was only ever one list. I'd just given it a second name."
hints:
  nudge: "After line 4, how many lists are there? Count the boxes, not the names."
  plan:
    - Find the line that makes baking_sheet
    - Give baking_sheet a list of its own
    - Sort that one and leave orders alone
  shape: |
    baking_sheet = ___(orders)
---
Run Pip's program. Mrs Vance asked first, so the last line should be `Serve first: Vance`.

Fix it so the baking sheet is in alphabetical order and `orders` stays in the order people asked.
