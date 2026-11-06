---
id: predict-rolling
type: predict
title: Two at a time
concept: pandas-basics
code: |
  import pandas as pd

  temps = pd.Series([8.0, 9.0, 10.0, 9.0])
  print(temps.rolling(2).mean().tolist())
question: What does this print?
options:
  - text: "[nan, 8.5, 9.5, 9.5]"
    correct: true
    feedback: "Right. Each value is averaged with the one before it. The first has nothing before it, so it's `NaN`, and the list stays the same length."
  - text: "[8.5, 9.5, 9.5]"
    misconception: rolling-drops-start
    feedback: "A rolling average keeps every label. The first value can't be averaged with two, so it's `NaN`, not left out."
  - text: "[8.0, 8.5, 9.5, 9.5]"
    misconception: rolling-uses-what-it-has
    feedback: "`rolling(2)` waits for two values. With only one so far, it gives `NaN` rather than averaging what it has."
---
A rolling average two years long.
