---
id: investigate
type: investigate
title: Edges
concept: convolutions
dialogue:
  - neil.pleased.point: "The Clocktower in ones and noughts, and a kernel underneath. Then the same kernel on its side."
code: |
  import numpy as np
  from workshop import show_grid


  def convolve(image, kernel):
      rows = image.shape[0] - kernel.shape[0] + 1
      cols = image.shape[1] - kernel.shape[1] + 1
      out = np.zeros((rows, cols))
      for i in range(rows):
          for j in range(cols):
              out[i, j] = np.sum(image[i:i + kernel.shape[0], j:j + kernel.shape[1]] * kernel)
      return out


  # The Clocktower at dusk: 1 is the tower and the street, 0 is the sky
  tower = np.array([
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ])
  kernel = np.array([[-1, 0, 1],
                     [-2, 0, 2],
                     [-1, 0, 1]])      # right minus left, the middle row counted twice

  edges = convolve(tower, kernel)
  show_grid(edges, title="What the kernel sees")
  print(edges.astype(int))
tasks:
  - id: still
    prompt: "Run it, and look at the grid under the output: green for plus, brick for minus. What does the kernel give where nothing changes, inside the tower or in open sky?"
    kind: answer
    accept: ["0", "zero", "nothing"]
    feedback: "0. The kernel's weights add up to 0, so on a patch that's all one shade the pluses and minuses cancel. It only answers to change."
    wrong: "Look at the middle column of the printed numbers, which sits inside the tower."
  - id: which-edges
    prompt: "Which edges does it find: the sides of the tower, or the tops? Answer sides or tops."
    kind: answer
    accept: ["sides", "the sides", "side", "left and right", "vertical"]
    feedback: "The sides: plus where sky turns to tower going right, minus where tower turns back to sky."
    wrong: "Where are the big numbers: down the columns, or along a row?"
  - id: turned
    prompt: "Change the kernel to `kernel.T`, the same grid turned on its side, and run it again. Which edges now: sides or tops?"
    kind: answer
    accept: ["tops", "top", "the tops", "the top", "top and bottom", "horizontal", "the top and the street"]
    feedback: "The tops: the ledge under the roof and the line of the street. The same weights, turned, look for a different edge. A network with a few kernels can look for several things at once."
    wrong: "Find the rows with big numbers in them. What is in the picture there?"
---
The kernel is a small picture of what it's looking for: dark on the left, light on the right. Wherever the patch underneath looks like that, the sum is big. Wherever it looks the opposite way, it's big and negative.

`show_grid` draws `edges` as a grid of tiles, tinted by value. It's for looking; nothing checks it.
