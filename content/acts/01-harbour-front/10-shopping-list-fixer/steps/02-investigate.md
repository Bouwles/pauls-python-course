---
id: investigate-slices
type: investigate
title: Cutting a slice
concept: slicing
code: |
  shopping = ["flour", "yeast", "butter", "sugar", "eggs"]
  print(shopping[0:2])
tasks:
  - id: first-slice
    prompt: "Run it. What does it print?"
    kind: answer
    accept: ["['flour', 'yeast']", "[\"flour\", \"yeast\"]", "flour, yeast", "flour yeast", "flour and yeast"]
    feedback: "Two items, from positions 0 and 1. A slice stops just before the second number."
    wrong: "Copy the output exactly, brackets and all."
  - id: how-many
    prompt: "Change it to `shopping[1:4]`. How many items does it print?"
    kind: answer
    accept: ["3", "three"]
    feedback: "Three: positions 1, 2 and 3. Stop minus start is how many you get."
  - id: last-two
    prompt: "Try `shopping[-2:]`. Which two items come out?"
    kind: answer
    accept: ["sugar, eggs", "['sugar', 'eggs']", "sugar and eggs", "sugar eggs"]
    feedback: "The last two. Leave a number out and the slice runs to that end of the list."
  - id: past-the-end
    prompt: "Try `shopping[3:50]`. The list only has five items. What happens?"
    kind: answer
    accept: ["['sugar', 'eggs']", "sugar, eggs", "sugar and eggs", "sugar eggs", "it prints the last two", "it prints sugar and eggs"]
    feedback: "No crash. A slice gives you whatever is there, even if you ask for more."
    wrong: "Copy what it prints. It doesn't crash."
  - id: first-three
    prompt: "Change the print so it shows the first three items."
    kind: run
    tests: |
      TESTS = [
          output("The first three", expect="['flour', 'yeast', 'butter']",
                 hint="Positions 0, 1 and 2. The stop number is one past the last one you want."),
      ]
    solution: |
      shopping = ["flour", "yeast", "butter", "sugar", "eggs"]
      print(shopping[:3])
---
A **slice** takes part of a list: `shopping[start:stop]`. It makes a new list and leaves the old one alone.

Work through the questions on the left.
