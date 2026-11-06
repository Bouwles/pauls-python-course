---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral: "Parcels for the Clocktower this week. Who we expected one for, and who actually got one."
code: |
  expected = ["Aaesha", "Yahya", "Riya", "Caitlin", "Yahya"]
  delivered = ["Yahya", "Caitlin", "Paul"]


  def show(items):
      if len(items) == 0:
          return "none"
      return ", ".join(sorted(items))


  def check_parcels(expected, delivered):
      expected = set(expected)
      delivered = set(delivered)
      print(f"Expected: {len(expected)} people")
      print("Arrived:", show(expected & delivered))
      print("Not yet:", show(expected - delivered))
      print("Surprises:", show(delivered - expected))


  check_parcels(expected, delivered)
subgoals:
  - label: Say so when the set is empty
    lines: [6, 7]
  - label: "Sort before showing: sets have no order"
    lines: [8, 8]
  - label: Turn each list into a set, dropping the repeats
    lines: [12, 13]
  - label: Count the different items
    lines: [14, 14]
  - label: "In both: &"
    lines: [15, 15]
  - label: "In one but not the other: -, the right way round"
    lines: [16, 17]
explain:
  prompt: "Why does `Not yet` use `expected - delivered`, not `delivered - expected`?"
  answer: "Subtraction keeps what's in the left set and not in the right. Expected but not delivered is what's still to come. The other way round gives the surprises."
  concept: set-operations
---
Paul's parcel check has the same shape as Caitlin's report. Yahya was written down twice, and the set keeps one of him, so 4 people are expected.

`show` turns a set into one line, and says `none` when there's nothing to show. Lines 16 and 17 subtract the same two sets the opposite way round, and get different answers.

The labels beside the code are the steps he took. They're the comments in your file.
