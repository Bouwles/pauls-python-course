---
id: predict-accuracy
type: predict
title: Eighty-seven per cent
concept: classification-metrics
dialogue:
  - riya: "My first one says no to everyone. It's never once been fooled."
code: |
  import numpy as np

  # Two thousand respondents: 1 for diabetes or prediabetes, 0 for none
  cases = np.array([1] * 263 + [0] * 1737)
  first_model = np.zeros(2000, dtype=int)     # no, every time

  accuracy = np.mean(first_model == cases)
  caught = np.sum((first_model == 1) & (cases == 1))
  print(round(accuracy, 2), caught)
question: "What does this print: the first model's accuracy, then the cases it caught?"
options:
  - text: "0.5 0"
    misconception: guessing-scores-half
    feedback: "A model that ignores the answers isn't a coin. It's right on every respondent that matches its one answer, and 1,737 of the 2,000 have no diabetes."
  - text: "0.87 0"
    correct: true
    feedback: "Right. Accuracy counts every respondent it got right, and people without diabetes are nearly all of them. It caught none of the 263 cases, which is the only thing a screening model is for."
  - text: "0.0 0"
    misconception: accuracy-counts-only-yes
    feedback: "Accuracy counts every right answer, yes or no. Saying no to someone without diabetes is right, so the model scores on 1,737 respondents without ever saying yes."
after: |
  Run it. Then change the model to say yes to everyone, `np.ones(2000, dtype=int)`, and run it again: every case caught, and an accuracy of 0.13.
---
`(first_model == 1) & (cases == 1)` is `True` for the respondents where both are true: `&` is `and`, one pair at a time, for whole arrays.

When one answer is rare, the classes are **imbalanced**, and accuracy rewards ignoring the rare one. Here is Riya's first model, scored on all two thousand respondents.
