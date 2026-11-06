---
id: learn-temperature
type: learn
title: Hot and cold writing
concept: language-models
code: |
  import numpy as np

  scores = np.array([3.0, 1.0, 0.0])

  for temperature in [1.0, 0.25, 4.0]:
      chances = np.exp(scores / temperature)
      print(temperature, np.round(chances / chances.sum(), 2))
---
A language model gives a score to every character that could come next, softmax turns the scores into chances, and it draws one at random. Always taking the favourite gets stuck saying the same thing.

The **temperature** decides how adventurous the draw is. Divide every score by it before the softmax. Below 1, the gaps between scores grow, and the favourite pulls ahead: at `0.25` it's nearly certain. Above 1, the gaps shrink and the chances even out: at `4.0` even the outsider gets nearly a quarter.

The order never changes: the favourite stays the favourite. Only how far ahead it is.

The usual mistake is thinking a higher temperature makes the model surer. It makes it less sure.
