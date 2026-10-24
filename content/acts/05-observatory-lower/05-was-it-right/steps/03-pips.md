---
id: pips
type: pips
title: Pip's Version
files: [scores.py]
entry: scores.py
dialogue:
  - pip: "Proper scores this time. Recall 0.80: it catches four storms in five."
  - pip: "Professor Wendt counted them with a pencil. She got a different answer. She usually does."
dialogue_after:
  - pip: "Precision starts from the warnings. Recall starts from the storms. I've written it on my wing."
hints:
  nudge: "Recall asks: of the 25 storms, how many were warned? Which two counts add up to 25?"
  plan:
    - Precision, from the warnings
    - Recall, from the real cases
  shape: |
    def precision(tp, fp, fn):
        return tp / (tp + ___)


    def recall(tp, fp, fn):
        return tp / (tp + ___)
---
Pip scores Penhallow's forecast at a threshold of 0.5. Run it and read the first line: it warned 15 times, 12 of them storms, and missed 13.

Now check his two numbers against those counts by hand, the way Professor Wendt did. Then fix `precision` and `recall`.
