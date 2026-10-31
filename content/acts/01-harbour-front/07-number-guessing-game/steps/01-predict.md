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
    feedback: "Right. Each pass prints and takes one off `lives`. When `lives` reaches 0, `lives > 0` is `False` and the loop ends."
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
    feedback: "Only the indented lines repeat. `print(\"Game over\")` waits until the loop has finished."
after: |
  Run it.
---
Caitlin's games all have lives. A game keeps going for as long as you have some left, however long that is.

A `for` loop knows before it starts how many passes it will make. A `while` loop doesn't. It keeps going for as long as its test is `True`, and asks again at the top of every pass.
