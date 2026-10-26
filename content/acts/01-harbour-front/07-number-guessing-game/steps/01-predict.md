---
id: predict-while
type: predict
title: While it lasts
concept: while-loops
code: |
  fog = 3
  while fog > 0:
      print("Horn")
      fog = fog - 1
  print("Clear")
question: What does this print?
options:
  - text: |-
      Horn
      Horn
      Horn
      Clear
    correct: true
    feedback: "Right. Each pass sounds the horn and takes one off `fog`. When `fog` reaches 0, `fog > 0` is `False` and the loop ends."
  - text: |-
      Horn
      Clear
    misconception: while-is-if
    feedback: "That's what an `if` would do. A `while` goes back to the top after each pass and asks again, until the answer is `False`."
  - text: |-
      Horn
      Clear
      Horn
      Clear
      Horn
      Clear
    misconception: unindented-line-in-loop
    feedback: "Only the indented lines repeat. `print(\"Clear\")` waits until the loop has finished."
after: |
  Run it.
---
You can hear Tom's fog horn from the Drowned Anchor. It sounds for as long as there's fog, however long that is.

A `for` loop knows before it starts how many passes it will make. A `while` loop doesn't. It keeps going for as long as its test is `True`, and asks again at the top of every pass.
