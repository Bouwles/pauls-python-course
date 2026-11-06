---
id: learn-sample
type: learn
title: Writing, a character at a time
concept: language-models
code: |
  import numpy as np

  vocab = ["a", "e", "s"]
  probs = np.array([[0.1, 0.1, 0.8],      # after "a"
                    [0.3, 0.3, 0.4],      # after "e"
                    [0.1, 0.8, 0.1]])     # after "s"

  rng = np.random.default_rng(3)
  current = 2                             # start after an "s"
  written = []
  for _ in range(8):
      current = int(rng.choice(3, p=probs[current]))
      written.append(vocab[current])
  print("".join(written))
---
A language model can write. Start somewhere, then draw the next character at random from the row of the one before, using that row's chances. Then draw the one after from the new character's row, and so on.

`rng.choice(3, p=probs[current])` draws one id from 0 to 2, each with the chance in that row. A seeded `rng`, from `np.random.default_rng(3)`, makes the same text every time.

In the example an `s` is nearly always followed by an `e`, so `se` turns up again and again. It knows only one character back, so it can't remember what it was spelling.

For the forecasts, start after the newline, the character that ends every forecast, so the first character drawn is one that starts a line.

The usual mistake is drawing every character from the starting row.
