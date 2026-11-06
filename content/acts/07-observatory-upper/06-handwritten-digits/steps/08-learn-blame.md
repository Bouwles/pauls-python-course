---
id: learn-blame
type: learn
title: The tidiest gradient
concept: classification-networks
code: |
  import numpy as np

  chances = np.array([[0.7, 0.2, 0.1],
                      [0.3, 0.6, 0.1]])
  labels = np.array([0, 2])
  answers = np.eye(3)[labels]

  d_scores = (chances - answers) / len(labels)    # the blame at the scores
  print(d_scores.round(2))
  print(chances.argmax(axis=1))                  # each row's answer: its biggest chance
---
Softmax followed by cross-entropy has the tidiest gradient in the building. Worked through the chain rule, the blame at the scores is just the chances minus the one-hot answers, divided by the number of rows:

```text
d_scores = (chances - answers) / n
```

Too much chance on a wrong answer is blamed, so its score is pushed down. Too little on the right one is blamed the other way, so its score is pushed up. From there back, the layers pass the blame on exactly as in Neural Network from Scratch.

To read off the network's answer, take each row's biggest chance: `chances.argmax(axis=1)`. The example's second digit should have been a 2, but the network says `1`.

The usual mistake is `argmax(axis=0)`, which picks a row for each column instead.
