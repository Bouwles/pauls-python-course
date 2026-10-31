---
id: predict-image
type: predict
title: A picture is a matrix
concept: matrices
dialogue:
  - caitlin: "I found a photograph to practise on. A lighthouse in North Carolina. My phone keeps pictures as numbers."
  - neil: "A matrix of brightnesses. Well, an array. Well, it's the same thing, and you know what I mean."
code: |
  import numpy as np

  image = np.array([[0, 50, 100],
                    [150, 200, 250]])
  print(image[:, ::-1])
  print(image.T.shape)
question: "A picture two pixels high and three wide, 0 for black and 255 for white. What does this print?"
options:
  - text: |-
      [[100  50   0]
       [250 200 150]]
      (3, 2)
    correct: true
    feedback: "Right. Before the comma is the rows, all of them; after it, the columns, back to front. So every row is reversed: the picture in a mirror. `.T` swaps rows with columns, so two by three becomes three by two."
  - text: |-
      [[150 200 250]
       [  0  50 100]]
      (3, 2)
    misconception: comma-slice-flips-rows
    feedback: "That's `image[::-1]`, the rows in reverse: upside down. In `image[:, ::-1]` the `::-1` comes after the comma, so it works on the columns, reversing each row."
  - text: |-
      [[100  50   0]
       [250 200 150]]
      (2, 3)
    misconception: transpose-keeps-shape
    feedback: "The mirror's right, but `.T` doesn't keep the shape. It swaps rows and columns, so a picture two high and three wide becomes three high and two wide."
after: |
  Run it. Then print `image[::-1].T`. Which way has the picture turned?
---
A greyscale photograph is a matrix: one row of numbers for each row of pixels, from 0 for black to 255 for white. Slicing, arithmetic and transposing all work on it as on any array, and each one does something you can see.
