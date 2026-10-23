---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Old Tom wanted a notice for the lighthouse door. Same trade, smaller board."
code: |
  # Old Tom's notice for the lighthouse door
  heading = input("Heading? ")
  message = input("Message? ")

  heading = heading.strip()
  message = " ".join(message.split())

  heading = heading.upper()

  if len(heading) > 30:
      heading = heading[:27] + "..."

  message = message.replace("&", "and")

  print("-" * 30)
  print(heading.center(30))
  print(message)
  print("-" * 30)
inputs: ["  visitors  ", "Mind the steps   &  the gulls."]
subgoals:
  - label: Ask for the text
    lines: [2, 3]
  - label: Tidy the spaces
    lines: [5, 6]
  - label: Change the case
    lines: [8, 8]
  - label: Cut it to fit
    lines: [10, 11]
  - label: Replace what has to go
    lines: [13, 13]
  - label: Frame it and centre it
    lines: [15, 18]
explain:
  prompt: "Line 8 says `heading = heading.upper()`. What would happen with only `heading.upper()`?"
  answer: "Nothing would change. A string can't be altered; `.upper()` makes a new one, and without `heading =` the new one is thrown away."
  concept: immutability
---
`.strip()` takes spaces off both ends. `.replace("&", "and")` swaps every `&` for `and`: the lighthouse printer prints `&` as a smudge.

Every line that changes text starts with a name and `=`. That isn't tidiness. It's the only way the change sticks.
