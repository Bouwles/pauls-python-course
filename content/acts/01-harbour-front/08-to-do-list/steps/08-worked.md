---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "My repairs queue. First in, first mended. Same machinery as Mira's list."
code: |
  # The workshop queue: repairs in the order they came in
  repairs = []

  while True:
      command = input("Command? ")
      if command == "shut":
          break
      elif command == "in":
          repairs.append(input("Repair? "))
      elif command == "next":
          if len(repairs) == 0:
              print("Queue's empty. Put the kettle on.")
          else:
              print("Working on:", repairs.pop(0))
      elif command == "show":
          for spot in range(len(repairs)):
              print(f"{spot + 1}. {repairs[spot]}")
      else:
          print("in, next, show or shut.")

  print(f"Still waiting: {len(repairs)}")
inputs: ["in", "Tom's kettle", "in", "Gwen's till", "show", "next", "shut"]
subgoals:
  - label: Start with an empty list
    lines: [2, 2]
  - label: Keep asking for a command
    lines: [4, 5]
  - label: Stop on the quit word
    lines: [6, 7]
  - label: Add to the end
    lines: [8, 9]
  - label: Take one out, if there is one
    lines: [10, 14]
  - label: Show each item with its number from 1
    lines: [15, 17]
  - label: Catch anything else
    lines: [18, 19]
  - label: Report after the loop
    lines: [21, 21]
explain:
  prompt: "Line 17 prints `spot + 1`, but line 14 uses `pop(0)`. Why add one in one place and not the other?"
  answer: "Python's indexes start at 0 and people's numbers start at 1. `spot + 1` turns an index into the number a person reads. `pop(0)` is talking to Python, so it uses the index."
  concept: indexing
---
`[]` is an empty list, ready to fill. `repairs.pop(0)` takes off the first item and hands it back, so the oldest repair is always next.

`range(len(repairs))` gives every index the list has, so the loop fits however many repairs are waiting. With none, it runs zero times.
