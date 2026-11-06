---
id: investigate
type: investigate
title: Two lists, side by side
concept: zip
code: |
  names = ["Jon Hale", "Mae Grant", "Ray Lowe"]
  chests = [112, 96, 101]

  for name, chest in zip(names, chests):
      print(name, chest)
tasks:
  - id: second-line
    prompt: "Run it. What is the second line of the output?"
    kind: answer
    accept: ["Mae Grant 96"]
    feedback: "`zip` walks both lists together and hands over one pair each time round. `name, chest` unpacks the pair into two variables."
    wrong: "Copy the second line exactly as it appears, name and number."
  - id: uneven
    prompt: "Add `\"Sam Wells\"` to the end of `names` only, and run it again. How many lines print now?"
    kind: answer
    accept: ["3", "three"]
    feedback: "Still three. `zip` stops at the end of the shorter list and says nothing. Sam gets no line and no error, which is worth knowing."
    wrong: "Count the lines in the output panel. Has Sam appeared?"
  - id: number-them
    prompt: "Take Sam out again. Then number the players from 1: in line 4, wrap `zip(names, chests)` in `enumerate(..., start=1)` and unpack `number, (name, chest)`. Print all three, so the first line is `1 Jon Hale 112`."
    kind: run
    tests: |
      TESTS = [
          output("Numbered from 1", expect="1 Jon Hale 112\n2 Mae Grant 96\n3 Ray Lowe 101",
                 hint="enumerate hands over (number, item) pairs. Each item here is itself a pair, so unpack it as number, (name, chest)."),
      ]
    solution: |
      names = ["Jon Hale", "Mae Grant", "Ray Lowe"]
      chests = [112, 96, 101]

      for number, (name, chest) in enumerate(zip(names, chests), start=1):
          print(number, name, chest)
---
Caitlin's names and chest sizes, in two lists in the same order.

`enumerate` can number the pairs that `zip` makes. Each item it numbers is then a pair itself, so unpack it in brackets: `number, (name, chest)`.
