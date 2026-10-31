---
id: predict-break
type: predict
title: Leaving early
concept: break-continue
code: |
  guess = 0
  while True:
      guess = guess + 1
      if guess == 3:
          print("Got it")
          break
      print("No,", guess)
  print("Game over")
question: What does this print?
options:
  - text: |-
      No, 1
      No, 2
      Got it
      Game over
    correct: true
    feedback: "Right. `break` leaves the loop at once. The rest of that pass is skipped, no more passes happen, and the program carries on after the loop."
  - text: |-
      No, 1
      No, 2
      Got it
      No, 3
      Game over
    misconception: break-finishes-pass
    feedback: "`break` doesn't wait for the end of the pass. It leaves straight away, so `No, 3` never prints."
  - text: |-
      No, 1
      No, 2
      Got it
    misconception: break-ends-program
    feedback: "`break` only leaves the loop. The line after the loop still runs."
  - text: |-
      No, 1
      No, 2
      Got it
      No, 4
      No, 5
      and so on, for ever
    misconception: break-continue-swapped
    feedback: "Skipping to the next pass is what `continue` does, and here it would never stop. `break` leaves the loop for good."
after: |
  Run it.
---
`while True:` is a loop whose test can never be `False`. It only stops when something inside it says so, and `break` means stop looping, now.

Caitlin's game needs exactly that. It doesn't know how many guesses it will take, but it knows when to stop.
