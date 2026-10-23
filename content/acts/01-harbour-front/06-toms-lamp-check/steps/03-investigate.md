---
id: investigate
type: investigate
title: Where range starts and stops
concept: range
code: |
  for check in range(4):
      print("Check", check)
tasks:
  - id: first
    prompt: "Run it. What number does the first check get?"
    kind: answer
    accept: ["0", "zero", "nought"]
    feedback: "0. `range` starts at 0 unless you tell it otherwise."
  - id: last
    prompt: "And the last?"
    kind: answer
    accept: ["3", "three"]
    feedback: "3. `range(4)` stops before 4: four numbers, 0 to 3."
  - id: start-at-one
    prompt: "Change it to `range(1, 5)` and run it. What are the first and last numbers now?"
    kind: answer
    accept: ["1 and 4", "1, 4", "1 4", "1 to 4", "1-4", "one and four", "1,4"]
    feedback: "1 and 4. With two numbers, `range(start, stop)` begins at the first and stops before the second."
    wrong: "Run it and read the top and bottom lines of the output. Answer like 1 and 4."
  - id: six-checks
    prompt: "Winter nights are long. Make it print `Check 1` down to `Check 6`."
    kind: run
    tests: |
      TESTS = [
          output("Six checks, from 1", expect="Check 1\nCheck 2\nCheck 3\nCheck 4\nCheck 5\nCheck 6",
                 hint="range stops before its second number. To finish on 6, stop at 7."),
      ]
    solution: |
      for check in range(1, 7):
          print("Check", check)
  - id: backwards
    prompt: "Now try `range(5, 0, -1)`. The third number is the step: how far to move each time. What is the last number printed?"
    kind: answer
    accept: ["1", "one"]
    feedback: "1. It counts 5, 4, 3, 2, 1 and stops before 0. A step of `-1` counts down."
---
The name after `for` is the **loop variable**. Here it's `check`. Each pass, it holds the next number from the range, and you can use it like any other variable.

Change the code, run it, answer the questions.
