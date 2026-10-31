---
id: predict-temperature
type: predict
title: Hot and cold
concept: language-models
dialogue:
  - aaesha: "Now it has been taught. Three Men in a Boat, three hundred and fifty thousand characters of it."
  - yahya: "So it writes the most likely next letter, every time. Simple."
  - neil: "Then it writes the same thing every time, too."
code: |
  import numpy as np

  scores = np.array([2.0, 1.0, 0.0])    # the next character: 'e', 'a' or 'z'

  for temperature in [1.0, 0.5, 2.0]:
      chances = np.exp(scores / temperature)
      chances = chances / chances.sum()
      print(temperature, round(chances[0], 2))
question: "How likely is 'e' at each temperature?"
options:
  - text: |-
      1.0 0.67
      0.5 0.87
      2.0 0.51
    correct: true
    feedback: "Right. Dividing by 0.5 doubles every gap between the scores, so the favourite pulls further ahead. Dividing by 2 halves the gaps, and the chances even out."
  - text: |-
      1.0 0.67
      0.5 0.51
      2.0 0.87
    misconception: high-temperature-sharpens
    feedback: "A higher temperature divides the scores by a bigger number, which shrinks the gaps between them, so the chances spread out. Hot is adventurous; cold sticks to the favourite."
  - text: |-
      1.0 0.67
      0.5 0.67
      2.0 0.67
    misconception: temperature-changes-nothing
    feedback: "The order stays the same, but softmax works on the gaps between scores, and dividing every score by 0.5 doubles every gap. The favourite's share changes even though it is still the favourite."
after: |
  Run it, then try a temperature of 0.1, and one of 10. Near 0 the favourite always wins; far above 1 every character is nearly as likely as the next.
---
A language model gives a score to every character that could come next, and softmax turns the scores into chances. To write, it draws one at random by those chances: always taking the favourite gets stuck in a loop.

The **temperature** divides the scores before the softmax.
