---
id: investigate
type: investigate
title: Where range starts and stops
concept: range
code: |
  for n in range(4):
      print(n, "x 3 =", n * 3)
tasks:
  - id: first
    prompt: "Run it. What number does the first line start with?"
    kind: answer
    accept: ["0", "zero", "nought"]
    feedback: "0. `range` starts at 0 unless you tell it otherwise. Nought threes are nought, which Ellie won't be asked."
  - id: last
    prompt: "And the last line?"
    kind: answer
    accept: ["3", "three"]
    feedback: "3. `range(4)` stops before 4: four numbers, 0 to 3."
  - id: start-at-one
    prompt: "Change it to `range(1, 5)` and run it. What do the first and last lines start with now?"
    kind: answer
    accept: ["1 and 4", "1, 4", "1 4", "1 to 4", "1-4", "one and four", "1,4"]
    feedback: "1 and 4. With two numbers, `range(start, stop)` begins at the first and stops before the second."
    wrong: "Run it and read the top and bottom lines of the output. Answer like 1 and 4."
  - id: twelve
    prompt: "Make it print the whole three times table, from `1 x 3 = 3` to `12 x 3 = 36`."
    kind: run
    tests: |
      TESTS = [
          output("1 to 12", expect="\n".join(f"{n} x 3 = {n * 3}" for n in range(1, 13)),
                 hint="range stops before its second number. To finish on 12, stop at 13."),
      ]
    solution: |
      for n in range(1, 13):
          print(n, "x 3 =", n * 3)
  - id: backwards
    prompt: "Now try `range(12, 0, -1)`. The third number is the step: how far to move each time. What number does the last line start with?"
    kind: answer
    accept: ["1", "one"]
    feedback: "1. It counts 12, 11, 10 and so on, and stops before 0. A step of `-1` counts down."
---
The name after `for` is the **loop variable**. Here it's `n`. Each pass, it holds the next number from the range, and you can use it like any other variable, even to multiply.

Change the code, run it, answer the questions.
