---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "My tool wall. I've numbered the hooks from nought. Easier than arguing with Python."
code: |
  # Moss's tool wall, hooks numbered from 0
  hooks = ["saw", "plane", "chisel", "mallet", "level"]

  for hook in range(len(hooks)):
      print(f"Hook {hook}: {hooks[hook]}")

  wanted = input("Which tool? ")
  if wanted in hooks:
      for hook in range(len(hooks)):
          if hooks[hook] == wanted:
              spot = hook
      hooks.pop(spot)
      print(f"Hook {spot}. Bring it back.")
  else:
      print(f"No {wanted}. Ask Pip.")

  print(f"Tools on the wall: {len(hooks)}")
inputs: ["chisel"]
subgoals:
  - label: Keep the items in a list
    lines: [2, 2]
  - label: Show every item with its index
    lines: [4, 5]
  - label: Ask what's wanted
    lines: [7, 7]
  - label: Check it's there at all
    lines: [8, 8]
  - label: Find its index
    lines: [9, 11]
  - label: Take it out
    lines: [12, 13]
  - label: Say so if it isn't
    lines: [14, 15]
  - label: Count what's left
    lines: [17, 17]
explain:
  prompt: "Why does line 4 loop over `range(len(hooks))` and not `range(5)`?"
  answer: "The wall won't always hold five tools. `len(hooks)` is however many there are right now, so the loop always fits the list."
  concept: looping-lists
---
`"chisel" in hooks` is `True` if the chisel is anywhere in the list.

`range(len(hooks))` gives every index the list has. With the index you get the number, and `hooks[hook]` gives the item.

When you only need the items, `for tool in hooks:` hands them over one at a time.
