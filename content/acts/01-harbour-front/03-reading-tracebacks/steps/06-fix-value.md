---
id: fix-value
type: fix
title: Script four, the shelf
hints:
  nudge: "Shelves come in parts of a metre. Which conversion can read \"4.5\"?"
  plan:
    - Run it with 4.5 and read the last line of the error
    - Find the conversion that can't read the text
    - Swap it for one that reads decimals
  shape: |
    length = input("Shelf length in metres? ")
    length = ___(length)
    print("Length in centimetres:", length * 100)
---
A **ValueError** means the type was right but the value wasn't usable. `int()` does take text, but it can't read `"4.5"` as a whole number.

Neil wrote this to fit shelves for the Studio's notebooks. Run it and type `4.5`. Fix it so it prints `Length in centimetres: 450.0`.
