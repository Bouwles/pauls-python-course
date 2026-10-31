---
id: make-model
type: make
title: The chance, from scratch
files: [diabetes.py, tools.py]
entry: diabetes.py
on_pass: { riya: "Twenty-seven per cent for our respondent. And general health counts most. People know, it seems." }
hints:
  nudge: "Which number goes into the miss: the score `X @ w + b`, or the chance after the sigmoid? And which side of the log loss does a respondent without diabetes pay?"
  plan:
    - Lock the test respondents away
    - Scale with the training respondents' ruler
    - Squash a score into a chance
    - Measure the miss
    - Step downhill
    - Score the test respondents, against saying no to everyone
    - Answer for one respondent
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
The requirements are at the top of `diabetes.py`; Paul's `tools.py` holds the loading, splitting and scaling, so you can spend your effort on the new part.

```text
bmi              +0.39
age_band         +0.30
high_bp          +0.58
high_chol        +0.27
general_health   +0.79
exercise         -0.04
Test accuracy: 0.85
Saying no to everyone: 0.85
Respondent: 27% chance of diabetes or prediabetes
```

The weights are on scaled answers, so they compare fairly. A positive weight pushes the chance up. `{chance:.0%}` prints a chance as a percentage.

Look at the two accuracies before you celebrate. They're the same. The second half of this project is about why that doesn't make the model useless.

The hidden checks measure your slopes by nudging each weight, train on answers of their own, and try other respondents.
