---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Convolution. Two loops and a slice. I did it on the back of a bus ticket."
  - pip: "It found the tower's edge. Twice. I'd say that's thorough."
dialogue_after:
  - pip: "So a window fits one more time than the difference. I always forget the one."
  - pip: "And kernels aren't always square. Wendt's got one that's three wide and one high. Who does that."
hints:
  nudge: "A 2 by 2 window on a 4 by 5 picture: how many places does it fit down, and how many across? Count them on the predict step's answer."
  plan:
    - Compare the shape Pip gets with the (3, 4) from A window on the lighthouse
    - Count the last place the window fits, as well as the first
    - Take the kernel's height and width separately
    - Use the height for the rows and the width for the columns, in the slice too
  shape: |
    def convolve(image, kernel):
        height, width = kernel.___
        rows = image.shape[0] - height ___
        cols = image.shape[1] - width ___
        out = np.zeros((rows, cols))
        for i in range(rows):
            for j in range(cols):
                out[i, j] = np.sum(image[i:i + ___, j:j + ___] * kernel)
        return out
---
Pip's `convolve` on the lighthouse should give the (3, 4) feature map from the first step: three rows of `0 2 0 -2`. Run it and compare.

There's a second bug, which the lighthouse can't show: try `convolve(image, np.array([[-1, 0, 1]]))`, a kernel one row high and three wide.
