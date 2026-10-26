---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Mira wanted her jobs alphabetical for the noticeboard. So I made her a copy and sorted it."
  - pip: "Now her own list says answer Agnes first. Mira says Agnes can wait."
dialogue_after:
  - pip: "So there was only ever one list. I'd just given it a second name."
hints:
  nudge: "After line 4, how many lists are there? Count the boxes, not the names."
  plan:
    - Find the line that makes board
    - Give board a list of its own
    - Sort that one and leave tasks alone
  shape: |
    board = ___(tasks)
---
Run Pip's program. Mira means to sort the post first, so the last line should be `First job: sort the post`.

Fix it so the noticeboard copy is in alphabetical order and `tasks` stays in Mira's order.
