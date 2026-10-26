---
id: pips
type: pips
title: Pip's Version
files: [risk.py, tools.py]
entry: risk.py
dialogue:
  - pip: "Risk model. Tested on people it never saw, this time. I've learnt."
  - pip: "It gives everyone about a coin toss. Fair, I thought. Nobody gets left out."
dialogue_after:
  - pip: "The chance goes into the miss. Not the score. The chance."
  - pip: "Mine was a straight line wearing a sigmoid as a hat."
hints:
  nudge: "In Moss's walk, which number was compared with what happened: the score, or the chance?"
  plan:
    - Work out the score
    - Squash it into a chance
    - Measure the miss from the chance
    - Step downhill
  shape: |
    for step in range(steps):
        chance = ___(X @ w + b)
        miss = ___ - y
        w = w - rate * X.T @ miss / len(y)
        b = b - rate * np.mean(miss)
---
Pip learns from three quarters of the respondents and gives a chance to each of the rest. Run it. Every chance sits between 47% and 63%, and the average is 53%, when about one respondent in eight really has diabetes or prediabetes. Professor Wendt calls that a shrug, not a model.

The trouble is one line inside `train`. Fix it so the walk goes downhill on the log loss. `tools.py` is Moss's, and it's fine.
