---
id: predict-precision
type: predict
title: Four flags, two cases
concept: classification-metrics
code: |
  import numpy as np

  flagged = np.array([1, 1, 1, 1, 0, 0, 0, 0, 0, 0])
  case = np.array([1, 0, 0, 0, 1, 0, 0, 0, 0, 0])

  tp = np.sum((flagged == 1) & (case == 1))
  fp = np.sum((flagged == 1) & (case == 0))
  fn = np.sum((flagged == 0) & (case == 1))
  print(tp / (tp + fp), tp / (tp + fn))
question: "What does this print: the precision, then the recall?"
options:
  - text: "0.25 0.5"
    correct: true
    feedback: "Right. One of the four flags was a real case, so the precision is 0.25. One of the two real cases was flagged, so the recall is 0.5."
  - text: "0.5 0.25"
    misconception: precision-recall-swapped
    feedback: "That's the two swapped. Precision starts from the flags: 1 right out of 4. Recall starts from the real cases: 1 caught out of 2."
  - text: "0.6 0.6"
    misconception: accuracy-fine-when-rare
    feedback: "0.6 is the accuracy: 6 of the 10 answers were right. Precision looks only at the flags, and recall only at the real cases."
---
Ten respondents. Four were flagged for a test, and two really have diabetes.
