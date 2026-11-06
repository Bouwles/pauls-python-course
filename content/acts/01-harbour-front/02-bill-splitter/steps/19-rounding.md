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
    prompt: "Press Run. What is the second line of the output?"
    kind: answer
    accept: ["7.2"]
    feedback: "7.2. `round(total, 2)` tidied the number, but it won't add a zero to make two places. To Python, 7.2 and 7.20 are the same number."
    wrong: "Copy the second line of the output exactly."
  - id: f-string
    prompt: "What is the last line of the output?"
    kind: answer
    accept: ["That's 7.20, please.", "That's 7.20, please", "7.20"]
    feedback: "`{total:.2f}` drops the total into the text with exactly two decimal places. The stored value doesn't change; only what's shown."
  - id: no-f
    prompt: "On line 4, delete the `f` just before the opening quote. Press Run. What appears where the price was?"
    kind: answer
    accept: ["{total:.2f}"]
    feedback: "Without the `f`, the curly brackets are just characters in the text. The `f` is what tells Python to work out what's inside them. Put it back for the last task."
    wrong: "Look at the last line of the output, between `That's` and `, please.`"
  - id: share
    prompt: "Replace all four lines with three of your own: `bill = 10.00`, then `each = bill / 3`, then an f-string that prints `Each pays: 3.33`. Press Run."
    kind: run
    tests: |
      TESTS = [
          output("Each pays 3.33", expect="Each pays: 3.33", match="last_line",
                 hint="The last line should be print(f\"Each pays: {each:.2f}\"), with a space after the colon in Each pays:."),
      ]
    solution: |
      bill = 10.00
      each = bill / 3
      print(f"Each pays: {each:.2f}")
---
Three drinks at 2.40 again, as in the Quick check on floats. This time the total is shown three ways.
