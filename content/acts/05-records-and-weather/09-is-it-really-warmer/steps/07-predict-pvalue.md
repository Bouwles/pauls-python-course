---
id: predict-pvalue
type: predict
title: At least as big
concept: permutation-tests
code: |
  import numpy as np

  shuffled = np.array([0.1, -0.3, 0.5, 0.0, 0.2, -0.1, 0.4, 0.3])
  real = 0.3
  print((shuffled >= real).mean())
question: "Eight shuffled differences and a real one. What does this print?"
options:
  - text: "0.375"
    correct: true
    feedback: "Right. Three of the eight are at least 0.3: the 0.5, the 0.4 and the 0.3 itself. Three eighths is 0.375."
  - text: "0.25"
    misconception: counts-only-bigger
    feedback: "\"At least as big\" includes equal. The shuffle that came out at exactly 0.3 counts, so it's three of eight."
  - text: "0.3"
    misconception: p-value-is-the-difference
    feedback: "The p-value isn't the difference. It's the share of shuffles that matched or beat it: three of the eight."
---
In a real test there would be thousands. Eight are enough to count by hand.
