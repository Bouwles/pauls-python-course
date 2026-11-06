---
id: predict-epsilon
type: predict
title: One in five explores
concept: exploration-exploitation
code: |
  import numpy as np

  rng = np.random.default_rng(1)
  estimates = [0.10, 0.17, 0.08, 0.12]
  epsilon = 0.2
  shown = [0, 0, 0, 0]
  for visitor in range(10000):
      if rng.random() < epsilon:
          version = int(rng.integers(4))
      else:
          version = int(np.argmax(estimates))
      shown[version] += 1
  print(round(shown[1] / 10000, 2))
question: "About what share of the visitors are shown version 1, the best estimate?"
options:
  - text: "0.85"
    correct: true
    feedback: "Right. Four visitors in five exploit and see version 1. The fifth explores, picks from all four screens, and lands on version 1 a quarter of the time too. That's 0.8 + 0.05."
  - text: "0.8"
    misconception: exploring-skips-best
    feedback: "Exploring picks from every screen, version 1 included. A quarter of the exploring visitors land on it anyway, so it's 0.8 + 0.05, about 0.85."
  - text: "1.0"
    misconception: exploring-stops-when-sure
    feedback: "Epsilon-greedy never stops exploring. One visitor in five still sees a random screen, however sure it is that version 1 is best."
---
The estimates stay fixed here, so only the exploring changes who sees what. Epsilon is 0.2 this time, and there are four screens.
