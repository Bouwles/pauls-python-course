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
Neil wrote this for the wings of a model glider. Run it, type `4.5`, and read the last line of the traceback.

Fix it so it prints `Wingspan in centimetres: 450.0`. Whole numbers, like `3`, still have to work.
