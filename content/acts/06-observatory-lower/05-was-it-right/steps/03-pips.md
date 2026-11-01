---
id: pips
type: pips
title: Fix Caitlin's version
files: [risk.py, tools.py]
entry: risk.py
dialogue:
  - caitlin.pleased: "Can you look at mine? Risk model. I copied the house price walk and put a sigmoid on the end."
  - caitlin.confused: "It gives everyone about a coin toss. Fair, I thought. Nobody gets left out."
dialogue_after:
  - caitlin.surprised: "The chance goes into the miss. Not the score. The chance."
  - caitlin.laughing: "Mine was a straight line wearing a sigmoid as a hat."
hints:
  nudge: "In Paul's walk, which number was compared with what happened: the score, or the chance?"
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
Caitlin's model learns from three quarters of the respondents and gives a chance to each of the rest. Run it. Every chance sits between 47% and 63%, and the average is 53%, when about one respondent in eight really has diabetes or prediabetes. Paul calls that a shrug, not a model.

The trouble is one line inside `train`. Fix it so the walk goes downhill on the log loss. `tools.py` is Paul's, and it's fine.
