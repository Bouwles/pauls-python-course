---
id: investigate-widths
type: investigate
title: Lining it up
concept: f-strings
code: |
  for n in range(8, 13):
      print(f"{n} x 7 = {n * 7}")
tasks:
  - id: ragged
    prompt: "Run it. Do the `x` signs sit in a straight line, one under the other?"
    kind: answer
    accept: ["no", "not quite", "no they don't", "no, they don't", "they don't", "nope"]
    feedback: "No. 10, 11 and 12 take two characters and 8 and 9 take one, so the lines below 9 are pushed along."
    wrong: "Look at where each x is. Are they all one under another?"
  - id: two-wide
    prompt: "Change `{n}` to `{n:2}` and run it again. How many characters does the 8 take up now?"
    kind: answer
    accept: ["2", "two"]
    feedback: "Two: a space, then the 8. `:2` means take up at least 2 characters. Numbers are pushed to the right, so the units line up."
  - id: already-wide
    prompt: "What does `{n:2}` do to 12, which already has two digits?"
    kind: answer
    accept: ["nothing", "no change", "it stays the same", "stays the same", "nothing changes", "leaves it alone", "it's unchanged", "unchanged"]
    feedback: "Nothing. The 2 is a minimum. A number that's already wide enough is left as it is."
  - id: answer-three
    prompt: "Give the answer a width of 3 as well, so the first line is ` 8 x 7 =  56`."
    kind: run
    tests: |
      TESTS = [
          output("Both columns lined up", expect=" 8 x 7 =  56\n 9 x 7 =  63\n10 x 7 =  70\n11 x 7 =  77\n12 x 7 =  84",
                 hint="Two widths: {n:2} for the first number and {n * 7:3} for the answer."),
      ]
    solution: |
      for n in range(8, 13):
          print(f"{n:2} x 7 = {n * 7:3}")
---
Ellie's teacher wants the table neat: every `x` and every `=` in a column.

In an f-string, a colon and a number after the name, like `{n:2}`, sets a **width**: the least number of characters the value will take up. Spaces fill the rest.
