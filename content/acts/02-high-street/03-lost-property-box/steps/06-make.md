---
id: make
type: make
title: Make the lost property matcher
on_pass: { caitlin.surprised: "Four lines. No umbrella counted twice. That's a first for this box." }
hints:
  nudge: "Which set operation gives 'handed in and asked about', and which gives 'in one but not the other'? Which way round does each subtraction go?"
  plan:
    - Turn each list into a set, dropping the repeats
    - Count the different items handed in
    - "In both: &"
    - "In one but not the other: -, the right way round"
    - Sort before showing, and show none for an empty set
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
Write `report(found, reported)` for the Studio's box:

```
Handed in: 4 different items
Matched: black umbrella, red scarf
Nobody has asked about: blue headphones, dice bag
Still missing: spare controller
```

Items go in alphabetical order. A line with nothing on it says `none`. The checks try other boxes, including an empty one.

The starter suggests a helper, `show`, for turning a set into a line. You don't have to use it, but it saves writing the same thing three times.
