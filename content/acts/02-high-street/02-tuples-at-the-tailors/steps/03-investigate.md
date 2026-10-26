---
id: investigate
type: investigate
title: Two lists, side by side
concept: zip
code: |
  names = ["Captain Ferro", "Bea Hollis", "Old Tom"]
  chests = [112, 96, 101]

  for name, chest in zip(names, chests):
      print(name, chest)
tasks:
  - id: second-line
    prompt: "Run it. What is the second line of the output?"
    kind: answer
    accept: ["Bea Hollis 96"]
    feedback: "`zip` walks both lists together and hands over one pair each time round. `name, chest` unpacks the pair into two variables."
    wrong: "Copy the second line exactly as it appears, name and number."
  - id: uneven
    prompt: "Add `\"Gwen\"` to the end of `names` only, and run it again. How many lines print now?"
    kind: answer
    accept: ["3", "three"]
    feedback: "Still three. `zip` stops at the end of the shorter list and says nothing. Gwen gets no line and no error, which is worth knowing."
    wrong: "Count the lines in the output panel. Has Gwen appeared?"
  - id: number-them
    prompt: "Mr Okonjo numbers his clients from 1. Wrap the `zip(...)` in `enumerate(..., start=1)` and unpack `number, (name, chest)`, so the first line is `1 Captain Ferro 112`."
    kind: run
    tests: |
      TESTS = [
          output("Numbered from 1", expect="1 Captain Ferro 112\n2 Bea Hollis 96\n3 Old Tom 101",
                 hint="enumerate hands over (number, item) pairs. Each item here is itself a pair, so unpack it as number, (name, chest)."),
      ]
    solution: |
      names = ["Captain Ferro", "Bea Hollis", "Old Tom"]
      chests = [112, 96, 101]

      for number, (name, chest) in enumerate(zip(names, chests), start=1):
          print(number, name, chest)
---
`zip` pairs up two lists, item by item. Each pair is a tuple, and `for name, chest in ...` **unpacks** it into two variables as it arrives.

`enumerate` counts as it goes: it hands over `(number, item)` pairs, so nobody has to keep a counter by hand.
