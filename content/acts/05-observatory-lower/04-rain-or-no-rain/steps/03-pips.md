---
id: pips
type: pips
title: Pip's Version
files: [forecast.py, tools.py]
entry: forecast.py
dialogue:
  - pip: "Rain forecast. Tested on evenings it never saw, this time. I've learnt."
  - pip: "It's 0.56 on the test evenings. Guessing dry every night gets 0.60. I checked twice."
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
Pip learns from three quarters of the evenings and tests on the rest. Run it, and read the first line: every chance it gives sits between 40% and 73%. Professor Wendt calls that a shrug, not a forecast.

The trouble is one line inside `train`. Fix it so the walk goes downhill on the log loss. `tools.py` is Moss's, and it's fine.
