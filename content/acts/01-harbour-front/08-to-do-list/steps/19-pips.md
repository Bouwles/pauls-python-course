---
id: pips
type: pips
title: Fix Aaesha's version
dialogue:
  - aaesha.pleased: "Riya wanted her jobs in alphabetical order for the whiteboard, and I didn't want two copies of one list."
  - aaesha.worried: "Duplicated data is how mistakes start, but now her own list says album cover first. Can you look?"
dialogue_after:
  - aaesha.thinking.think: "So it was only ever one list with two names. A copy that's meant to be different isn't really duplication."
hints:
  nudge: "After line 4, how many lists are there? Count the boxes, not the names."
  plan:
    - Find the line that makes board
    - Give board a list of its own
    - Sort that one and leave tasks alone
  shape: |
    board = ___(tasks)
---
Run Aaesha's program. Riya means to start with the rocket poster, so the last line should be `First job: rocket poster`.

Fix it so the whiteboard copy is in alphabetical order and `tasks` stays in Riya's order.
