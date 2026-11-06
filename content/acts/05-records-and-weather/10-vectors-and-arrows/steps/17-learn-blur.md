---
id: learn-blur
type: learn
title: Averaging the neighbours
concept: matrices
code: |
  import numpy as np

  image = np.array([[0, 0, 0],
                    [0, 90, 0],
                    [0, 0, 0]])
  padded = np.pad(image, 1, mode="edge")
  rows, cols = image.shape
  total = np.zeros(image.shape)
  for down in range(3):
      for across in range(3):
          total = total + padded[down:down + rows, across:across + cols]
  print(total / 9)
---
To blur a picture, make each pixel the average of the 3 by 3 block around it. Picture a small window sliding over the photograph, each pixel replaced by the average brightness inside the window.

There's no need to visit pixels one by one. `np.pad(image, 1, mode="edge")` adds a border a pixel wide that repeats the edge, so the edge pixels have neighbours too. Then `padded[1:1 + rows, 1:1 + cols]` is the picture itself, and changing either 1 to 0 or 2 shifts it a pixel. Add all nine shifts, and divide by 9.

The example blurs one bright pixel into a 3 by 3 block of `10.`s: its 90, shared nine ways.

The usual slip is the border. Pad with zeros instead, and the edges come out darker than they should.
