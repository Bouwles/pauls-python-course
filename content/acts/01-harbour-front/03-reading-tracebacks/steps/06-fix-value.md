---
id: fix-value
type: fix
title: Script four, the glider
hints:
  nudge: "Wings come in parts of a metre. Which conversion can read \"4.5\"?"
  plan:
    - Run it with 4.5 and read the last line of the error
    - Find the conversion that can't read the text
    - Swap it for one that reads decimals
  shape: |
    wingspan = input("Wingspan in metres? ")
    wingspan = ___(wingspan)
    print("Wingspan in centimetres:", wingspan * 100)
---
A **ValueError** means the type was right but the value wasn't usable. `int()` does take text, but it can't read `"4.5"` as a whole number.

Neil wrote this for the wings of a model glider. Run it and type `4.5`. Fix it so it prints `Wingspan in centimetres: 450.0`.
