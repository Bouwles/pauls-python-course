---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Bea adds up her takings at closing. She never knows how many sales either."
code: |
  # Bea's takings, one sale at a time, until she types done
  total = 0
  sales = 0

  entry = input("Sale? ")
  while entry != "done":
      total = total + float(entry)
      sales = sales + 1
      entry = input("Sale? ")

  print(f"{sales} sales, {total:.2f} in the till")
inputs: ["2.40", "0.85", "3.25", "done"]
subgoals:
  - label: Start the totals at zero
    lines: [2, 3]
  - label: Ask before the loop
    lines: [5, 5]
  - label: Loop until the sentinel
    lines: [6, 6]
  - label: Add to the totals
    lines: [7, 8]
  - label: Ask again at the bottom
    lines: [9, 9]
  - label: Report after the loop
    lines: [11, 11]
explain:
  prompt: "Why are `total = 0` and `sales = 0` above the loop, and not inside it?"
  answer: "Inside the loop they would go back to 0 on every pass, and only the last sale would count. Above it, they start at 0 once and then grow."
  concept: running-totals
---
A **running total** starts at 0 and grows by some amount on every pass. A **counter** is the same idea, growing by 1 each time.

`float(entry)` only happens after the test, so the word `done` is never turned into a number.
