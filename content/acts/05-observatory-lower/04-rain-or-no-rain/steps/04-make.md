---
id: make
type: make
title: Make the rain forecast
files: [rain.py, tools.py]
entry: rain.py
on_pass: { wendt: "Seventy-eight per cent, and it knows why: the glass is falling. I'll keep the dome shut." }
hints:
  nudge: "Which number goes into the miss: the score `X @ w + b`, or the chance after the sigmoid? And which side of the log loss does a dry evening pay?"
  plan:
    - Lock the test evenings away
    - Scale with the training evenings' ruler
    - Squash a score into a chance
    - Measure the miss
    - Step downhill
    - Score the test evenings, against always guessing dry
    - Decide about tonight
  shape: |
    def predict_proba(X, w, b):
        return sigmoid(___)


    def log_loss(y, p):
        return -np.mean(y * np.log(___) + (1 - y) * np.log(___))


    def gradients(X, y, w, b):
        miss = ___ - y
        return X.T @ miss / len(y), np.mean(___)


    def decide(p, threshold=0.5):
        return (p ___ threshold).astype(int)
---
Now the whole notebook. The requirements are at the top of `rain.py`; Moss's `tools.py` holds the loading, splitting and scaling from the last three jobs, so you can spend your effort on the new part.

```text
humidity         +1.72
pressure         -0.69
pressure_change  -2.13
cloud            +1.40
Test accuracy: 0.86
Always guessing dry: 0.60
Tonight: 78% chance of rain. Keep the dome shut.
```

The weights are on scaled readings, so they compare fairly. A positive weight pushes towards rain. `{tonight:.0%}` prints a chance as a percentage.

Always guessing dry is the bar to clear: it's right on every dry evening and costs nothing to build.

The hidden checks measure your slopes by nudging each weight, train on evenings of their own, and try other evenings and thresholds.
