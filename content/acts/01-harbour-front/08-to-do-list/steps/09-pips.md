---
id: pips
type: pips
title: Fix Aaesha's version
dialogue:
  - aaesha: "Neil wanted his jobs in alphabetical order for the whiteboard. I didn't want two copies of one list."
  - aaesha: "Duplicated data is how mistakes start. But now his own list says answer Caitlin first. Can you look?"
dialogue_after:
  - aaesha: "So there was only ever one list with two names. A copy that's meant to differ isn't duplication."
hints:
  nudge: "After line 4, how many lists are there? Count the boxes, not the names."
  plan:
    - Find the line that makes board
    - Give board a list of its own
    - Sort that one and leave tasks alone
  shape: |
    board = ___(tasks)
---
Run Aaesha's program. Neil means to mark the quizzes first, so the last line should be `First job: mark the quizzes`.

Fix it so the whiteboard copy is in alphabetical order and `tasks` stays in Neil's order.
