---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "I did one for Mira last week. Have a look before you start."
code: |
  # Sign for the post office counter.
  # Mira wants it in this order: name, hours, warning.

  print("{{TOWN}} POST OFFICE")
  print("Open 8 till 1, Monday to Saturday")
  print('Parcels over 2 kg go on the "heavy" shelf')
subgoals:
  - label: Say what the program is for
    lines: [1, 2]
  - label: Print each line of the sign, top to bottom
    lines: [4, 5]
  - label: Use the other kind of quotes when the text contains quotes
    lines: [6, 6]
explain:
  prompt: "Why does line 6 use single quotes on the outside?"
  answer: "The text has double quotes in it, around \"heavy\". If the outside quotes were double too, Python would think the text ended at the second one."
  concept: strings
---
Text inside quotes is called a **string**. Python accepts double quotes `"like this"` or single quotes `'like this'`, as long as the start and end match.

The labels in the margin are the steps Moss took. You'll use the same steps for the shop sign.
