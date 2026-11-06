---
id: predict-continue
type: predict
title: Not that one
concept: break-continue
code: |
  count = 0
  while count < 4:
      count = count + 1
      if count == 2:
          continue
      print("Guess", count)
  print("Done")
question: What does this print?
options:
  - text: |-
      Guess 1
      Guess 3
      Guess 4
      Done
    correct: true
    feedback: "On the pass where `count` is 2, `continue` skips the `print` and goes back to the top. The loop still runs to the end, because `count` was already added to before the skip."
  - text: |-
      Guess 1
      Guess 2
      Guess 3
      Guess 4
      Done
    misconception: continue-means-carry-on
    feedback: "In Python, `continue` doesn't mean carry on with this pass. It skips the rest of it, so `Guess 2` never prints."
  - text: |-
      Guess 1
      Done
    misconception: break-continue-swapped
    feedback: "Leaving the loop altogether is `break`. `continue` only skips the rest of one pass, and the loop carries on with 3 and 4."
---
This loop counts up to 4 and skips one number on the way.
