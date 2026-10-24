---
id: predict-accuracy
type: predict
title: Ninety-four per cent
concept: classification-metrics
dialogue:
  - pip: "It's never once said storm. It's never once been fooled, either."
code: |
  import numpy as np

  # Four hundred nights: 1 for a storm, 0 for calm
  storms = np.array([1] * 25 + [0] * 375)
  pips_forecast = np.zeros(400, dtype=int)     # calm, every night

  accuracy = np.mean(pips_forecast == storms)
  caught = np.sum((pips_forecast == 1) & (storms == 1))
  print(round(accuracy, 2), caught)
question: "What does this print: Pip's accuracy, then the storms his forecast caught?"
options:
  - text: "0.5 0"
    misconception: guessing-scores-half
    feedback: "A forecast that ignores the weather isn't a coin. It's right on every night that matches its one answer, and 375 of the 400 nights were calm."
  - text: "0.94 0"
    correct: true
    feedback: "Right. Accuracy counts every night it got right, and calm nights are nearly all of them. It caught none of the 25 storms, which is the only thing a storm forecast is for."
  - text: "0.0 0"
    misconception: accuracy-counts-only-yes
    feedback: "Accuracy counts every right answer, yes or no. Saying calm on a calm night is right, so Pip scores on 375 nights without ever saying storm."
after: |
  Run it. Then change the forecast to say storm every night, `np.ones(400, dtype=int)`, and run it again: every storm caught, and an accuracy of 0.06.
---
`(pips_forecast == 1) & (storms == 1)` is `True` on the nights both are true: `&` is `and`, one pair at a time, for whole arrays.

Pip's storm forecast is one line long. Here it is, scored on four hundred nights like Penhallow's.
