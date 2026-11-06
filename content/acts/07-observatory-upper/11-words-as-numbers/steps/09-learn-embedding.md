---
id: learn-embedding
type: learn
title: A row of numbers per token
concept: embeddings
dialogue:
  - neil.thinking: "Counting won't stretch to longer memories. A network will. So the characters go in as rows."
code: |
  import numpy as np

  E = np.array([[0.5, 0.5],      # "a"
                [0.9, 0.1],      # "e"
                [0.0, 1.0]])     # "s"

  s = np.array([0, 0, 1])        # "s", as a one-hot row
  print(s @ E)
  print(E[2])
---
A network can learn the same model, and later grow it. First the characters have to go in as numbers it can multiply.

An id alone won't do: id 2 isn't twice id 1. So each character goes in as a **one-hot** row, all zeros with a 1 at its id, as for the digits' answers.

Multiplying a one-hot row by a matrix `E` picks out one row of `E`, because every other row is multiplied by 0. That row is the character's **embedding**: a short list of numbers that stands for it. The example's `s @ E` is just `E[2]`.

The network learns `E` like any other weight. Characters that keep similar company end up with rows that point the same way.

The usual mistake is thinking the embedding was written by someone. It's learnt.
