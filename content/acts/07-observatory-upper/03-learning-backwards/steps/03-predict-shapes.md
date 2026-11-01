---
id: predict-shapes
type: predict
title: Which way round
concept: neural-networks
dialogue:
  - neil.neutral: "My next page has two layers. Four readings in, three answers out."
  - neil.laughing: "I wrote the first layer down as five rows of four. It made sense at the time."
code: |
  import numpy as np

  evenings = np.array([[0.9, 0.2, 0.5, 1.0],     # 2 evenings,
                       [0.1, 0.7, 0.8, 1.0]])    # 4 readings each
  W1 = np.ones((5, 4))                           # 5 rows, 4 columns, as Neil wrote it

  hidden = evenings @ W1
  print(hidden.shape)
question: What happens?
options:
  - text: "A ValueError: the shapes don't line up"
    correct: true
    error: ValueError
    feedback: "Right. (2, 4) @ (5, 4): each row of evenings has 4 numbers, but each column of W1 has 5. The inner numbers must match. `W1.T` turns it round to (4, 5), and then the answer is (2, 5)."
  - text: "(2, 5)"
    misconception: matmul-turns-itself-round
    feedback: "That's the shape you want, but NumPy never turns a matrix round for you. It can't know which way you meant, so it refuses. You write `W1.T` yourself."
  - text: "(2, 4)"
    misconception: matmul-number-by-number
    feedback: "`@` isn't number by number; that's `*`. Each row on the left meets each column on the right, so the left's 4 columns must match the right's rows, and there are 5."
after: |
  Run it and read the last line of the error: it names both sizes. Then change `W1` to `W1.T` and run it again.
---
A network works on a whole batch of evenings at once: one row per evening, one column per reading.

`@` is matrix multiplication. Each row of the left meets each column of the right, and their numbers are multiplied in pairs and added up: a weighted sum, exactly as in one neuron. So the shapes must line up:

```
(n, k) @ (k, m)  gives  (n, m)
```

The inner numbers must match, and they vanish. `W1` holds one column of weights per hidden neuron.
