---
id: make-scores
type: make
title: Scored honestly
files: [diabetes.py, tools.py]
entry: diabetes.py
starter_from: make-model
on_pass: { paul.proud: "Flag at one in ten and it finds three cases in four. For a free blood test, I'd take that." }
hints:
  nudge: "Precision and recall share a numerator. What's on the bottom of each: the flags, or the real cases? And which pile chooses the screening threshold?"
  plan:
    - Count the four kinds of respondent
    - Draw the table
    - Precision, from the flags; recall, from the real cases; F1 for both
    - Every threshold at once, from the highest chance down
    - Add up the area in trapezoids
    - A threshold for screening, chosen on the training respondents
  shape: |
    def roc_curve(y, chances):
        fpr, tpr = [0.0], [0.0]
        for threshold in np.unique(chances)[___]:
            tp, fp, fn, tn = confusion(y, decide(chances, threshold))
            tpr.append(tp / ___)
            fpr.append(fp / ___)
        return np.array(fpr), np.array(tpr)


    def auc(fpr, tpr):
        return float(np.sum((fpr[1:] - fpr[:-1]) * (___ + ___) / 2))
---
Add `confusion`, `precision`, `recall`, `f1`, `roc_curve`, `auc` and `threshold_for_recall` to `diabetes.py`, as Paul's rain alert and the ROC examples did them. Give 0.0 wherever there's nothing to divide by. Then score the test respondents:

```text
At a threshold of 0.5, on 500 respondents it never saw:
              diabetes   none
flagged              8      8
not flagged         67    417
Accuracy 0.85, precision 0.50, recall 0.11, F1 0.18
Saying no to everyone: accuracy 0.85, recall 0.00
AUC: 0.811
To catch 85% of cases in training, flag at 0.10 or more.
On the test respondents: recall 0.77, precision 0.32, 183 of 500 flagged
Respondent: 27% chance. Flag for a test.
```

`threshold_for_recall(y, chances, target)` is the highest distinct chance that catches at least `target` of the cases. Choose it on the training respondents. Chosen on the test pile, the test would stop being a test.
