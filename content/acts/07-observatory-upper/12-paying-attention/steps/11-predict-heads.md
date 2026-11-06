---
id: predict-heads
type: predict
title: Two heads, side by side
concept: transformers
dialogue:
  - neil.neutral: "Two at once. One head for one kind of question, one for another."
code: |
  import numpy as np

  head_one = np.ones((10, 4))     # what one head gave back for ten characters
  head_two = np.ones((10, 4))     # and another head, with its own Wq, Wk, Wv

  joined = np.concatenate([head_one, head_two], axis=1)
  Wo = np.ones((8, 8))
  print(joined.shape, (joined @ Wo).shape)
question: What does this print?
options:
  - text: "(10, 8) (10, 8)"
    correct: true
    feedback: "Right. Side by side, each character gets both heads' answers: 4 numbers from each. `Wo` then mixes the 8 back into a row of 8."
  - text: "(10, 4) (10, 4)"
    misconception: heads-are-added
    feedback: "The heads aren't added or averaged. Their outputs are put side by side, so each keeps its own columns, and `Wo` learns how to combine them."
  - text: "(20, 4), then a ValueError"
    misconception: concat-stacks-rows
    error: ValueError
    feedback: "`axis=1` joins along the columns. Stacking them as rows would make 20 characters, which isn't what happened."
after: |
  Run it. Then try `axis=0`.
---
Two heads' answers for ten characters, joined, then mixed by `Wo`.
