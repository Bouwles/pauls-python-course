---
id: learn-image
type: learn
title: A picture is a matrix
concept: matrices
dialogue:
  - riya.pleased.wave: "Part two. A photograph of a lighthouse. My drawing app keeps pictures as numbers."
code: |
  import numpy as np

  image = np.array([[0, 50, 100],
                    [150, 200, 250]])
  print(image[::-1])
  print(np.clip(image + 40, 0, 255))
---
A greyscale photograph is a matrix: one row of numbers for each row of pixels, from 0 for black to 255 for white. Slicing and arithmetic work on it as on any array, and each one does something you can see.

- `image[::-1]` is the rows in reverse order: upside down.
- `image[:, ::-1]` reverses each row: a mirror image. The `::-1` after the comma works on the columns.
- `image.T` swaps rows and columns, so a picture two high and three wide becomes three high and two wide.
- `image + 40` brightens every pixel, and `np.clip(image, 0, 255)` keeps every value between 0 and 255.

The example turns a tiny picture upside down, then brightens it: the 250 stops at `255`.

The usual slip is to mix up the two slices. Before the comma is rows; after it, columns.
