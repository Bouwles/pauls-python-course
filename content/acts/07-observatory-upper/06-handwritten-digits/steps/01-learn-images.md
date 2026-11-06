---
id: learn-images
type: learn
title: A picture is a grid of numbers
concept: classification-networks
dialogue:
  - aaesha.pleased.point: "You read handwriting without trying. The network gets sixty-four greys, and no more."
code: |
  import numpy as np

  # A 4 by 4 digit 1, in greys from 0 (paper) to 16 (ink)
  one = np.array([[0, 0, 16, 0],
                  [0, 12, 16, 0],
                  [0, 0, 16, 0],
                  [0, 8, 16, 8]])

  for row in one:
      print("".join("#" if grey > 8 else "." for grey in row))
  row = one.reshape(-1) / 16
  print(row.shape, row[:4])
---
To a computer, a scanned digit is a grid of numbers, one per square, saying how dark it is. The digits in this project are 8 by 8 squares of grey, from 0 for blank paper to 16 for solid ink.

A network takes a row of readings, so each grid is flattened into one row: `reshape(-1)` lays the rows end to end, 64 greys for an 8 by 8 digit. Dividing by 16 puts every grey between 0 and 1, so no sum starts out huge.

The example draws a small 4 by 4 one, a `#` for every dark square, then flattens it into 16 numbers.

The network never sees the shape, only the numbers, in a fixed order. The usual mistake is to think it sees a picture. It sees a list of greys.
