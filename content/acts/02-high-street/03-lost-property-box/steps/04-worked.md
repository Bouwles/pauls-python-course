---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "Parcels for the Clocktower this week. Who we expected one for, and who actually got one."
code: |
  expected = ["Aaesha", "Yahya", "Riya", "Caitlin", "Yahya"]
  delivered = ["Yahya", "Caitlin", "Paul"]

  expected = set(expected)
  delivered = set(delivered)

  arrived = expected & delivered
  not_yet = expected - delivered
  surprises = delivered - expected

  print("Arrived:", ", ".join(sorted(arrived)))
  print("Not yet:", ", ".join(sorted(not_yet)))
  print("Surprises:", ", ".join(sorted(surprises)))
subgoals:
  - label: Turn each list into a set, dropping the repeats
    lines: [4, 5]
  - label: "In both: &"
    lines: [7, 7]
  - label: "In one but not the other: -, the right way round"
    lines: [8, 9]
  - label: "Sort before showing: sets have no order"
    lines: [11, 13]
explain:
  prompt: "Why does `not_yet` use `expected - delivered`, not `delivered - expected`?"
  answer: "Subtraction keeps what's in the left set and not in the right. Expected but not delivered is what's still to come; the other way round gives the surprises."
  concept: set-operations
---
Yahya was written down twice. The set keeps one.

`-` on sets means *in this one, not in that one*. Order matters, as it does with numbers: line 8 and line 9 give different answers.
