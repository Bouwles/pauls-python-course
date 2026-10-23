---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "The back door has a padlock. Three tries, then it jams. Same shape as Gwen's game."
code: |
  # The back-door padlock: three tries, then it jams
  secret = 4172

  for attempt in range(1, 4):
      code = int(input("Code? "))
      if code < 1000 or code > 9999:
          print("Four digits.")
          continue
      if code == secret:
          print(f"Open, on try {attempt}.")
          break
      print("Wrong.")

  if code != secret:
      print("Jammed. Fetch the oil.")
inputs: ["12", "1234", "4172"]
subgoals:
  - label: Set up what you're guessing
    lines: [2, 2]
  - label: Give a fixed number of tries
    lines: [4, 4]
  - label: Ask inside the loop
    lines: [5, 5]
  - label: Skip a daft answer
    lines: [6, 8]
  - label: Leave early on a win
    lines: [9, 11]
  - label: React to a miss
    lines: [12, 12]
  - label: After the loop, check how it ended
    lines: [14, 15]
explain:
  prompt: "Why does line 14 check `code != secret` again, after the loop?"
  answer: "The loop can end two ways: `break` on a win, or running out of tries. Only the second should say Jammed, and the last code typed is how to tell them apart."
  concept: break-continue
---
`continue` skips the rest of this pass and goes straight to the next. Here a code that isn't four digits is skipped, but it still uses up a try: the loop has already moved on.

The labels are yours for the game.
