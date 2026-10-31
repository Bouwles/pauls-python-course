---
id: predict-dropout
type: predict
title: Half asleep
concept: dropout
dialogue:
  - caitlin: "Dropout. Switch off half the neurons at random. Sounds like sabotage."
  - neil: "It is sabotage. On purpose, and a different half every time."
code: |
  import numpy as np

  rng = np.random.default_rng(4)
  hidden = np.array([0.8, 0.2, 0.5, 0.9, 0.4, 0.6])    # one night's hidden layer
  rate = 0.5

  for epoch in range(2):
      keep = rng.random(6) >= rate
      print(hidden * keep / (1 - rate))
question: "The first time round, `keep` is `[True True True False True False]`. What does this print?"
options:
  - text: |-
      [1.6 0.4 1.  0.  0.8 0. ]
      [1.6 0.  1.  1.8 0.8 0. ]
    correct: true
    feedback: "Right. A fresh coin for every neuron, every time, so the second epoch sleeps a different set. The ones awake are divided by 0.5, doubled, so the layer's total stays about the same on average."
  - text: |-
      [1.6 0.4 1.  0.  0.8 0. ]
      [1.6 0.4 1.  0.  0.8 0. ]
    misconception: dropout-mask-fixed
    feedback: "`rng.random` gives new numbers every call, so each epoch drops a different set. If the same neurons slept every time, that would just be a smaller network."
  - text: |-
      [0.8 0.2 0.5 0.  0.4 0. ]
      [0.8 0.  0.5 0.9 0.4 0. ]
    misconception: dropout-no-rescale
    feedback: "The right neurons sleep, but the ones awake are divided by `1 - rate`. With half the layer gone, each survivor counts double, so the next layer sees about the same total."
  - text: |-
      [0.4 0.1 0.25 0.45 0.2 0.3]
      [0.4 0.1 0.25 0.45 0.2 0.3]
    misconception: dropout-scales-all
    feedback: "Dropout doesn't turn every neuron down a bit. Each one is either fully off or fully on, and the ones on are scaled up."
after: |
  Run it. Then put `rng.random(6)` in a variable and print it too, to see each coin.
---
**Dropout** switches off each hidden neuron with chance `rate`, on every training step, with a fresh choice each time. No neuron can count on any particular other one being there, so the network can't build one fragile path through every noisy night.

The neurons left awake are divided by `1 - rate`, so the next layer sees about the same total.

At evaluation nothing sleeps and nothing is scaled: every neuron is awake.
