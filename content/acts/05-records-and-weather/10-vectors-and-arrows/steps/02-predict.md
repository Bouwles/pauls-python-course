---
id: predict-add
type: predict
title: Two days of wind
concept: vectors
dialogue:
  - caitlin.proud: "Ten knots Monday, ten knots Tuesday. Twenty knots between them. That's just adding."
code: |
  import numpy as np

  monday = np.array([6.0, 8.0])      # knots east, knots north
  tuesday = np.array([-6.0, 8.0])
  both = monday + tuesday
  print(both)
  print(np.linalg.norm(monday), np.linalg.norm(both))
question: What does this print?
options:
  - text: |-
      [ 0. 16.]
      10.0 16.0
    correct: true
    feedback: "Right. Adding arrows adds east to east and north to north. The east parts cancel, the north parts pile up, and the sum is 16 knots long, not 20."
  - text: |-
      [ 0. 16.]
      10.0 20.0
    misconception: vector-adds-lengths
    feedback: "Lengths only add when the arrows point the same way. Monday's wind leans east and Tuesday's leans west, so those parts cancel: the sum is (0, 16), and its length is 16."
  - text: |-
      [ 0. 16.]
      14.0 16.0
    misconception: length-is-sum
    feedback: "6 east and 8 north don't make 14. They're at right angles, so the length is Pythagoras: the square root of 36 + 64, which is 10."
after: |
  Run it. Then try `print(2 * monday)`: twice as long, pointing the same way.
---
Adding two arrays adds them number by number, so adding two arrows puts one on the end of the other.

`np.linalg.norm` gives an arrow's length.
