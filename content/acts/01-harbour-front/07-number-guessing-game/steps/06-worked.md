---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "The back door has a padlock. I forget the code. Same shape as Gwen's game."
code: |
  # The back-door padlock. q gives up and fetches the oil.
  secret = 4172
  tries = 0

  while True:
      entry = input("Code? ")
      if entry == "q":
          print("Giving up. Fetch the oil.")
          break
      code = int(entry)
      if code < 1000 or code > 9999:
          print("Four digits.")
          continue
      tries = tries + 1
      if code == secret:
          print(f"Open, after {tries} tries.")
          break
      print("Wrong.")
inputs: ["12", "1234", "4172"]
subgoals:
  - label: Set up the secret and the counter
    lines: [2, 3]
  - label: Keep going until something stops it
    lines: [5, 5]
  - label: Ask, and stop on the quit word
    lines: [6, 9]
  - label: Skip a daft guess without counting it
    lines: [10, 13]
  - label: Count the try
    lines: [14, 14]
  - label: Stop on a win
    lines: [15, 17]
  - label: React to a miss
    lines: [18, 18]
explain:
  prompt: "Why does Moss check for `q` on line 7, before `int(entry)` on line 10?"
  answer: "`int(\"q\")` is a ValueError. The quit word has to be caught while it's still text, before anything tries to turn it into a number."
  concept: sentinels
---
`continue` skips the rest of this pass and goes back to the top. The daft code skips line 14, so it never counts as a try.

`tries` starts at 0 above the loop. Inside the loop it would go back to 0 on every pass.

The labels are yours for the game.
