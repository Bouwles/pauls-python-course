---
id: predict-blur
type: predict
title: A bright corner
concept: matrices
code: |
  import numpy as np

  image = np.array([[0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 90]])
  padded = np.pad(image, 1, mode="edge")
  rows, cols = image.shape
  total = np.zeros(image.shape)
  for down in range(3):
      for across in range(3):
          total = total + padded[down:down + rows, across:across + cols]
  blurred = total / 9
  print(blurred[0, 0], blurred[2, 3])
question: What does this print?
options:
  - text: "0.0 40.0"
    correct: true
    feedback: "Right. The corner's window hangs over the border, and the border repeats the 90 below it, to its right and on the diagonal. Four 90s in nine: 40."
  - text: "0.0 10.0"
    misconception: pad-adds-zeros
    feedback: "`mode=\"edge\"` doesn't pad with zeros. It repeats the edge, so the 90 in the corner is copied into the border three times."
  - text: "0.0 90.0"
    misconception: blur-keeps-pixel
    feedback: "A blurred pixel is the average of its whole window, not itself. The window holds four 90s and five 0s."
---
The same blur, on a picture with one bright pixel in its bottom-right corner.
