---
id: predict
type: predict
title: A window on the Clocktower
concept: convolutions
dialogue:
  - neil: "A network that reads digits pixel by pixel has never heard of an edge."
  - neil: "So: a little window, slid across a picture. Here's the smallest."
code: |
  import numpy as np

  # The Clocktower from the street: dark sky is 0, the tower is 1
  image = np.array([[0, 0, 1, 1, 0],
                    [0, 0, 1, 1, 0],
                    [0, 0, 1, 1, 0],
                    [0, 0, 1, 1, 0]])
  kernel = np.array([[-1, 1],
                     [-1, 1]])           # right minus left

  rows = image.shape[0] - kernel.shape[0] + 1
  cols = image.shape[1] - kernel.shape[1] + 1
  out = np.zeros((rows, cols), dtype=int)
  for i in range(rows):
      for j in range(cols):
          out[i, j] = np.sum(image[i:i + 2, j:j + 2] * kernel)

  print(out.shape)
  print(out[0])
question: What does this print?
options:
  - text: |-
      (3, 4)
      [ 0  2  0 -2]
    correct: true
    feedback: "Right. A 2 by 2 window fits in 3 places down a 4-row picture and 4 places across a 5-column one. Where sky turns to tower it says 2, where tower turns to sky it says -2, and where nothing changes it says 0. That's an edge detector."
  - text: |-
      (4, 5)
      [ 0  2  0 -2  0]
    misconception: conv-output-same-size
    feedback: "The window has to fit inside the picture, so it can't sit on the last row or column. The answer is smaller: one less each way for a 2 by 2 kernel, two less for 3 by 3."
  - text: |-
      (3, 4)
      [ 0 -2  0  2]
    misconception: kernel-flipped
    feedback: "The kernel is used as it's written: minus on the left, plus on the right. Sky on the left, tower on the right, gives -0 + 1 + -0 + 1, which is 2."
after: |
  Run it. Then add `print(out)`: every row is the same, because the tower is.
---
A **convolution** slides a small grid of weights, the **kernel**, over a picture. At each place it fits, it multiplies the kernel by the patch underneath and adds the lot up: a weighted sum, as in your first neuron, but of nine pixels or four, and the same weights at every place. The answers make a new picture, a **feature map**.
