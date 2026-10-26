---
id: rounding
type: investigate
title: Rounding money
concept: f-strings
code: |
  total = 2.40 * 3
  print(total)
  print(round(total, 2))
  print(f"That's {total:.2f}, please.")
tasks:
  - id: round-it
    prompt: "Run it. What does the second line print?"
    kind: answer
    accept: ["7.2"]
    feedback: "7.2. `round(total, 2)` rounds to two decimal places, but it won't add a zero to show them. To Python, 7.2 and 7.20 are the same number."
    wrong: "Copy the second line of the output exactly."
  - id: f-string
    prompt: "What does the last line print?"
    kind: answer
    accept: ["That's 7.20, please.", "That's 7.20, please", "7.20"]
    feedback: "`{total:.2f}` drops the total into the text, rounded and shown with exactly two decimal places. The stored value doesn't change; only what is shown."
  - id: no-f
    prompt: "Delete the `f` before the quotes on the last line and run it. What appears where the price was?"
    kind: answer
    accept: ["{total:.2f}"]
    feedback: "Without the `f`, the braces are just characters in the text. The `f` is what tells Python to work out what's inside them."
    wrong: "Look at the last line of the output, between \"That's\" and \", please\"."
  - id: share
    prompt: "Put the `f` back. Then change the program so it shares a bill of 10.00 between 3 people and prints `Each pays: 3.33`."
    kind: run
    tests: |
      TESTS = [
          output("Each pays 3.33", expect="Each pays: 3.33", match="last_line",
                 hint="Work out 10.00 / 3, then show it in an f-string with :.2f, after Each pays: and a space."),
      ]
    solution: |
      bill = 10.00
      each = bill / 3
      print(f"Each pays: {each:.2f}")
---
Money is written with two decimal places. Python has two tools for it.

`round(x, 2)` rounds the number itself. An **f-string**, with an `f` before the opening quote, drops values into text: anything inside `{}` is worked out, and `:.2f` after it means "show two decimal places".
