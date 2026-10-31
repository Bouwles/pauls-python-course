---
id: pips
type: pips
title: Fix Aaesha's version
dialogue:
  - aaesha: "Neil wants to know how many books are out. Emma's out. Alice is out. That's two."
  - aaesha: "My program says nought. No error, nothing red. Can you look?"
dialogue_after:
  - aaesha: "\"ON_LOAN\" is just text. Status.ON_LOAN is the status. They never match, and nothing complains."
hints:
  nudge: "What is `book.status`: a string, or a member of `Status`?"
  plan:
    - Find the comparison that is never true
    - Compare the status with a member of Status, not with text
  shape: |
    for book in books:
        if book.status == ___:
            out += 1
---
Run Aaesha's program. Two of the three books are on loan, so it should print `2 on loan`.

No traceback this time. Read the comparison carefully.
