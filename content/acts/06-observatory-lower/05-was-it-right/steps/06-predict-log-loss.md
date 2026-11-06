---
id: predict-log-loss
type: predict
title: Sitting on the fence
concept: cross-entropy
code: |
  import numpy as np

  happened = np.array([0, 0])
  chance = np.array([0.5, 0.5])
  paid = -(happened * np.log(chance) + (1 - happened) * np.log(1 - chance))
  print(round(np.mean(paid), 2))
question: What does this print?
options:
  - text: "0.69"
    correct: true
    feedback: "Right. Both were no, and each was given a chance of no of 0.5. Minus the log of 0.5 is about 0.69. Any useful model has to beat that."
  - text: "0.0"
    misconception: hedging-costs-nothing
    feedback: "Saying 0.5 isn't free. Each no was given only a 0.5 chance, and minus the log of 0.5 is about 0.69. Only a chance of 1 for what happened costs nothing."
  - text: "0.25"
    misconception: mse-fine-for-chances
    feedback: "0.25 is the mean squared error of 0.5 against 0. Log loss charges minus the log of the chance given to what happened: minus the log of 0.5, about 0.69."
---
A model that says 0.5 for everyone, on two respondents who both answered no.
