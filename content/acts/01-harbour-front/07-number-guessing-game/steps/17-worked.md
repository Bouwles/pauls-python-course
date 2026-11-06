---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.laughing: "The server cupboard has a padlock. I forget the code. Same shape as Caitlin's game."
code: |
  # The server cupboard padlock. q gives up and asks Neil.
  secret = 4172
  tries = 0

  while True:
      entry = input("Code? ")
      if entry == "q":
          print("Giving up. Ask Neil.")
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
  prompt: "Why does Paul check for `q` on line 7, before `int(entry)` on line 10?"
  answer: "`int(\"q\")` is a ValueError. The quit word has to be caught while it's still text, before anything tries to turn it into a number."
  concept: sentinels
---
Paul's padlock program has the same shape as Caitlin's game: a secret, a counter, a quit word, a code that doesn't count, and a win.

The labels beside the code are the steps he took. Line 13's `continue` skips a code that isn't four digits, so it never reaches line 14 and never counts as a try. Each `break` ends the loop: one for giving up, one for opening the lock.

Your game takes the same steps, in the same order.
