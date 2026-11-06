---
id: investigate-types
type: investigate
title: What type is it?
concept: type-function
code: |
  count = input("How many? ")
  print(count * 2)
inputs: ["3"]
tasks:
  - id: type-of-count
    prompt: "Add a new line at the bottom: `print(type(count))`. Press Run and type `3`. What type is `count`?"
    kind: answer
    accept: ["str", "<class 'str'>", "string", "a string", "text"]
    feedback: "`str`: a string. `input()` always hands back text, which is why `count * 2` printed `33`."
    wrong: "Look at the last line of the output, after `33`."
  - id: make-it-a-number
    prompt: "Add a new line 2: `count = int(count)`. Press Run and type `3`. It should print `6`, then the new type."
    kind: run
    tests: |
      TESTS = [
          output("Typing 3 gives 6", inputs=["3"], expect=r"^6$", match="regex",
                 hint="Line 2 should be count = int(count), between the input() line and the print."),
          output("Typing 10 gives 20", inputs=["10"], expect=r"^20$", match="regex"),
      ]
    solution: |
      count = input("How many? ")
      count = int(count)
      print(count * 2)
      print(type(count))
  - id: decimals
    prompt: "On line 2, change `int` to `float`. Press Run and type `2.5`. What is the first line of the output?"
    kind: answer
    accept: ["5.0"]
    feedback: "5.0. `float()` reads text with a decimal point, and the type line now says `float`. `int()` couldn't: given `\"2.5\"`, it stops with a ValueError."
    wrong: "Check that line 2 says `count = float(count)`, then copy the first line of the output exactly."
---
This asks how many, then doubles the answer, or tries to. Each task checks or changes what type of value `count` holds.
