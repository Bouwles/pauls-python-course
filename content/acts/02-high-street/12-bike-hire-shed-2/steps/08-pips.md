---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Mrs Vance wants to know how many books are out. Emma's out. The knots one's out."
  - pip: "It says nought. No error, nothing red. Just nought."
dialogue_after:
  - pip: "\"ON_LOAN\" is just text. Status.ON_LOAN is the status. They never match, and nothing complains."
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
Run Pip's program. Two of the three books are on loan, so it should print `2 on loan`.

No traceback this time. Read the comparison carefully.
