---
id: predict-str
type: predict
title: One Peter Jago, or three?
concept: data-cleaning
code: |
  import pandas as pd

  names = pd.Series([" peter jago", "Peter Jago ", "PETER JAGO"])
  print(len(names.str.title().unique()))
  print(len(names.str.strip().str.title().unique()))
question: What does this print?
options:
  - text: |-
      3
      1
    correct: true
    feedback: "Right. `title()` fixes the capitals but leaves the spaces, so ` Peter Jago` and `Peter Jago ` still differ. With `strip()` first, all three are the same."
  - text: |-
      1
      1
    misconception: title-strips-spaces
    feedback: "`title()` only changes capitals. The space at the front of one and the end of another are still there, so three different values are left."
---
The same volunteer, typed three ways.
