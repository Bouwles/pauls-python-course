---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Agnes charges moorings by length and by season. Same kind of decision."
code: |
  # Mooring fees for the north quay
  length = int(input("Boat length in metres? "))
  month = int(input("Month, 1 to 12? "))

  if length < 6:
      fee = 4.00
  elif length < 12:
      if month <= 2 or month == 12:
          fee = 5.00
      else:
          fee = 7.50
  else:
      fee = 12.00

  print(f"Mooring: {fee:.2f} a night")
inputs: ["8", "1"]
subgoals:
  - label: Ask for the numbers
    lines: [2, 3]
  - label: Choose the band, smallest first
    lines: [5, 7]
  - label: Decide again inside the band that has a special case
    lines: [8, 11]
  - label: Catch everything else
    lines: [12, 13]
  - label: Show the result
    lines: [15, 15]
explain:
  prompt: "Why is the winter test on line 8 indented under the `elif`, and not at the top?"
  answer: "Only middle-sized boats get a winter price. Inside the `elif`, the month is only asked about once Python knows the boat is 6 to 11 metres long."
  concept: nested-conditions
---
`or` is `True` if either side is `True`. `and` needs both sides. `not` turns `True` into `False` and back.

An `if` inside another `if` is **nested**. The inner test is only asked when the outer one has let Python in.
