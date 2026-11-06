---
id: make
type: make
title: Make the lost property matcher
on_pass: { caitlin.surprised: "Four lines. No umbrella counted twice. That's a first for this box." }
hints:
  nudge: "Which set operation gives 'handed in and asked about', and which gives 'in one but not the other'? Which way round does each subtraction go?"
  plan:
    - Say so when the set is empty
    - "Sort before showing: sets have no order"
    - Turn each list into a set, dropping the repeats
    - Count the different items
    - "In both: &"
    - "In one but not the other: -, the right way round"
  shape: |
    def show(items):
        if len(items) == 0:
            return ___
        return ", ".join(___(items))


    def report(found, reported):
        found = set(found)
        reported = set(reported)
        print(f"Handed in: {len(found)} different items")
        print("Matched:", show(found ___ reported))
        print("Nobody has asked about:", show(found ___ reported))
        print("Still missing:", show(___ - ___))
---
Write `report(found, reported)` for the Studio's box, and `show(items)` to turn a set into one line:

```
Handed in: 4 different items
Matched: black umbrella, red scarf
Nobody has asked about: blue headphones, dice bag
Still missing: spare controller
```

Items go in alphabetical order, with `, ` between them. A line with nothing on it says `none`.

The comments in the file are the steps from Paul's parcel check. The checks try other boxes too, including an empty one and one where everything matches.
