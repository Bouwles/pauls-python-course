---
id: predict-break
type: predict
title: Leaving early
concept: break-continue
code: |
  for guess in range(1, 6):
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
      Game over
    misconception: break-continue-swapped
    feedback: "Skipping to the next pass is what `continue` does. `break` leaves the loop for good."
after: |
  Run it.
---
`break` inside a loop means: stop looping, now.

Gwen's game needs it. Once somebody guesses right, there's no point asking again.
