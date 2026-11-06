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
    feedback: "`break` leaves the loop at once. The rest of that pass is skipped, no more passes happen, and the program carries on after the loop."
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
    feedback: "That's `break` read as skip the rest of this pass and carry on. It leaves the loop for good, so nothing after `Got it` repeats."
---
Each pass adds 1 to `guess`. Follow it pass by pass until `guess` is 3.
