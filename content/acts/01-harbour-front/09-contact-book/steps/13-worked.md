---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.thinking: "The clock's spare parts, in drawers. One day I'll use them. Nobody remembers the full names."
code: |
  # The clock's spare parts: a record for each one
  drawers = {
      "main spring": {"drawer": 3, "left": 2},
      "brass screw": {"drawer": 7, "left": 140},
      "spring washer": {"drawer": 3, "left": 9},
  }

  part = input("Part? ")
  while part != "":
      if part in drawers:
          record = drawers[part]
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
inputs: ["brass screw", "spring", "fuse", ""]
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
  answer: "`part in name` looks for the letters anywhere, so `a` would find every part with an a in it. Splitting the name into words means only a whole word counts: `spring` finds the main spring and the spring washer, and `spr` finds nothing."
  concept: split-join
---
Paul's spare parts for the clock are a dictionary of records, like Riya's book. Each part's record has a `drawer` and a count of how many are `left`.

The loop stops on `""`, empty text, which is what `input()` gives when you press Enter without typing. He checks `part in drawers` before looking a part up, so a part he doesn't have never crashes it. For a part that isn't there, he searches the words of every name and joins what he finds onto one line.

The labels beside the code are the steps he took. Riya's book takes the same steps, plus one for `add`.
