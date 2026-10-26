---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "My parts drawers. A little record for each part, and nobody remembers the full names."
code: |
  # Moss's parts drawers: a record for each part
  drawers = {
      "radio valve": {"drawer": 3, "left": 2},
      "brass screw": {"drawer": 7, "left": 140},
      "valve cap": {"drawer": 3, "left": 9},
  }

  part = input("Part? ")
  while part != "":
      record = drawers.get(part)
      if record is not None:
          print(f"{part}: drawer {record['drawer']}, {record['left']} left")
      else:
          print(f"No {part}.")
          matches = []
          for name in drawers:
              if part.lower() in name.split():
                  matches.append(name)
          if len(matches) > 0:
              print("Try: " + ", ".join(matches))
      part = input("Part? ")
inputs: ["brass screw", "valve", "fuse", ""]
subgoals:
  - label: Keep a record for each name
    lines: [2, 6]
  - label: Ask until a blank line
    lines: [8, 9]
  - label: Look the name up
    lines: [10, 11]
  - label: Show what's inside the record
    lines: [12, 12]
  - label: Search the words of every name
    lines: [13, 18]
  - label: Join what was found
    lines: [19, 20]
explain:
  prompt: "Line 17 checks `part.lower() in name.split()`. Why split the name, instead of `part in name`?"
  answer: "`part in name` looks for the letters anywhere, so `a` would find every part with an a in it. Splitting the name into words means only a whole word counts: `valve` finds the radio valve and the valve cap, and `val` finds nothing."
  concept: split-join
---
Each value in `drawers` is a dictionary of its own. `drawers.get(part)` hands back that inner dictionary, or `None` when there's no such part, and `is not None` asks whether it found one.

`record['drawer']` uses single quotes because the f-string already uses double ones.
