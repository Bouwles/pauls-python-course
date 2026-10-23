---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "My radio has valves. They warm up one at a time. Then I tune it."
code: |
  # Moss's radio: warm each valve, then tune down the dial
  valves = int(input("How many valves? "))

  for valve in range(1, valves + 1):
      print(f"Valve {valve}: warm")

  for station in range(10, 0, -2):
      print("Trying", station)

  print("Still static.")
inputs: ["4"]
subgoals:
  - label: Find out how many times
    lines: [2, 2]
  - label: Repeat, numbered from 1
    lines: [4, 5]
  - label: Count down
    lines: [7, 8]
  - label: Finish once, after the loops
    lines: [10, 10]
explain:
  prompt: "Why does line 4 say `range(1, valves + 1)` and not `range(valves)`?"
  answer: "`range(valves)` would number the valves 0 to 3. Starting at 1 and stopping at `valves + 1` numbers them 1 to 4, because range stops before its end."
  concept: range
---
Two loops, one after the other. The first counts up from 1. The second counts down in steps of 2.

`print("Still static.")` isn't indented, so it runs once, after both loops. It usually does.
