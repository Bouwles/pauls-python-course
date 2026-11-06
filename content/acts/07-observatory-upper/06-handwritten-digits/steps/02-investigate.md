---
id: investigate
type: investigate
title: The digits
concept: classification-networks
dialogue:
  - aaesha.pleased.point: "Here they are. Squint. Your eyes do the rest without asking."
code: |
  from notebooks import load_notebook_digits

  images, labels = load_notebook_digits()
  print(images.shape, images.min(), images.max())

  index = 1001
  for row in images[index]:
      print("".join(" .:-=+*#%@"[int(grey * 9 / 16)] * 2 for grey in row))
tasks:
  - id: how-many
    prompt: "Run it. The first number on the first line is how many digits there are. How many?"
    kind: answer
    accept: ["1797"]
    feedback: "1797 digits, each an 8 by 8 grid."
    wrong: "The shape is (digits, rows, columns). Read the first number."
  - id: biggest
    prompt: "What is the darkest grey in the whole collection: the biggest value in `images`?"
    kind: answer
    accept: ["16", "16.0"]
    feedback: "16. Paper is 0, ink is 16, so dividing by 16 puts every grey between 0 and 1 before it goes into the network. Big inputs saturate."
    wrong: "It's the last number on the first line."
  - id: which-digit
    prompt: "Digit 1001 is drawn underneath. What digit do you read? Then add `print(labels[index])` to check."
    kind: answer
    accept: ["4", "four"]
    feedback: "A 4, with a closed top. Or a 9 that gave up halfway, as Neil says."
    wrong: "Squint at the shape, then print labels[index] and see what it really is."
  - id: another
    prompt: "Set `index = 37`. What does `labels[index]` say this one is?"
    kind: answer
    accept: ["9", "nine"]
    feedback: "A 9. Before you checked, would you have been sure? The network gets the same sixty-four numbers you do, and no more."
    wrong: "Change index, run it, and print labels[index]."
---
`load_notebook_digits()` gives back every scanned digit as an 8 by 8 array of greys, and `labels`, the digit each one really is. The loop draws one digit in characters, denser ones for darker greys.

To see it properly, try `plt.imshow(images[index], cmap="gray_r")` and `plt.show()`.
