---
id: predict-tuple
type: predict
title: Written in ink
concept: tuples
code: |
  hale = (112, 98, 84)
  hale[0] = 110
  print(hale)
question: What happens when this runs?
verify: error
options:
  - text: "It prints (110, 98, 84)"
    misconception: tuples-can-change
    feedback: "That's what a list would do. A tuple can't be changed once it's made, so line 2 fails."
  - text: "It prints (112, 98, 84)"
    misconception: tuple-change-ignored
    feedback: "Python never quietly skips an instruction it can't carry out. Line 2 asks for something a tuple won't do, so the program stops there."
  - text: "A TypeError on line 2"
    correct: true
    error: TypeError
    feedback: "Right. A tuple can't be changed after it's made. To change Jon Hale's chest you build a new tuple."
after: |
  Run it. The last line of the traceback says what a tuple won't do.
---
A **tuple** is written with round brackets: `(112, 98, 84)`. This one is Jon Hale's chest, waist and leg, in centimetres. You read it the way you read a list: `hale[0]` is 112.

Lock in your answer, then run it.
