---
id: predict-while
type: predict
title: While it lasts
concept: while-loops
code: |
  lives = 3
  while lives > 0:
      print("Try again")
      lives = lives - 1
  print("Game over")
question: What does this print?
options:
  - text: |-
      Try again
      Try again
      Try again
      Game over
    correct: true
    feedback: "Each pass prints and takes one off `lives`. When `lives` reaches 0, `lives > 0` is `False` and the loop ends."
  - text: |-
      Try again
      Game over
    misconception: while-is-if
    feedback: "That's what an `if` would do. A `while` goes back to the top after each pass and asks again, until the answer is `False`."
  - text: |-
      Try again
      Game over
      Try again
      Game over
      Try again
      Game over
    misconception: unindented-line-in-loop
    feedback: "Only the indented lines repeat. `print(\"Game over\")` isn't indented, so it waits until the loop has finished."
---
Caitlin's games all have lives. This loop keeps going while there are some left.
