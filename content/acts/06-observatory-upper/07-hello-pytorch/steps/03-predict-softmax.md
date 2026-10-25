---
id: predict-double-softmax
type: predict
title: Softmax twice
concept: pytorch
dialogue:
  - pip: "I ended my PyTorch brain with a softmax, like upstairs. It's sure and it's right. The loss won't go below 1.4, though."
code: |
  import numpy as np


  def softmax(z):
      e = np.exp(z - z.max())
      return e / e.sum()


  def cross_entropy_from_scores(scores, right):
      """What nn.CrossEntropyLoss does: softmax the scores itself, then minus the log."""
      return -np.log(softmax(scores)[right])


  # Pip's brain is sure, and right: digit 3 by a mile
  scores = np.array([0.0, 0.0, 0.0, 20.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0])
  chances = softmax(scores)              # Pip's forward ends with a softmax

  print(round(cross_entropy_from_scores(scores, 3), 3))
  print(round(cross_entropy_from_scores(chances, 3), 3))
question: "The first line hands the loss raw scores; the second hands it Pip's chances. What does this print?"
options:
  - text: |-
      0.0
      1.461
    correct: true
    feedback: "Right. Pip's chances are all between 0 and 1, so a second softmax sees scores that hardly differ: 1 against nine 0s gives the right digit only 0.23. However sure his brain gets, the loss can't go below 1.461, and the gradients keep shoving at a brain that's already right."
  - text: |-
      0.0
      0.0
    misconception: softmax-twice-harmless
    feedback: "Softmax isn't something you can do twice and get the same thing. Its input is scores, any size; Pip's chances are squeezed between 0 and 1, and a softmax of those comes out nearly even."
  - text: |-
      1.461
      0.0
    misconception: loss-wants-chances
    feedback: "nn.CrossEntropyLoss wants the raw scores, because it does the softmax itself. It's the chances that go wrong: they get softmaxed a second time."
after: |
  Run it. Then try a score of 100 for digit 3: the second line hardly moves.
---
PyTorch can't run in this workshop, but its loss can be copied in NumPy. `nn.CrossEntropyLoss` takes raw scores and does the softmax inside, so `forward` should end at the last layer.
