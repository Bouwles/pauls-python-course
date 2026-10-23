---
id: investigate
type: investigate
title: Slicing text
concept: string-slicing
code: |
  title = "Lost: one lobster pot"
  print(title[0:4])
  print(len(title))
tasks:
  - id: first-four
    prompt: "Run it. What does the first line print?"
    kind: answer
    accept: ["Lost"]
    feedback: "`Lost`. A string slices like a list, one character per position, starting at 0."
  - id: length
    prompt: "What does `len(title)` give?"
    kind: answer
    accept: ["21"]
    feedback: "21. Spaces and the colon are characters too."
  - id: last-three
    prompt: "Change the first print to `title[-3:]`. What prints?"
    kind: answer
    accept: ["pot"]
    feedback: "`pot`, the last three characters."
  - id: centre
    prompt: "Add `print(title.center(31, \"*\"))`. How many stars are on each side?"
    kind: answer
    accept: ["5", "five"]
    feedback: "Five each. 31 minus 21 leaves 10 to share out. Without the `\"*\"`, `.center()` uses spaces."
  - id: cut
    prompt: "Make the first print show the title's first 12 characters followed by `...`."
    kind: run
    tests: |
      TESTS = [
          output("Cut to 12, then dots", expect=r"^Lost: one lo\.\.\.$", match="regex",
                 hint="Slice the first 12 characters, then join \"...\" on with +."),
      ]
    solution: |
      title = "Lost: one lobster pot"
      print(title[:12] + "...")
      print(len(title))
---
Text has positions, like a list: `title[0]` is the first character. Slices work the same way.

Work through the questions on the left.
