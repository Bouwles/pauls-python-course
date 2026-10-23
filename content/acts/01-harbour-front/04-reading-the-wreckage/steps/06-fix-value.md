---
id: fix-value
type: fix
title: Piece four, the height
hints:
  nudge: "Tide heights have decimals. Which conversion can read \"4.5\"?"
  plan:
    - Run it with 4.5 and read the last line of the error
    - Find the conversion that can't read the text
    - Swap it for one that reads decimals
  shape: |
    height = input("Tide height in metres? ")
    height = ___(height)
    print("Height in centimetres:", height * 100)
---
A **ValueError** means the type was right but the value wasn't usable. `int()` does take text, but it can't read `"4.5"` as a whole number.

Run it and type `4.5`. Fix it so it prints `Height in centimetres: 450.0`.
