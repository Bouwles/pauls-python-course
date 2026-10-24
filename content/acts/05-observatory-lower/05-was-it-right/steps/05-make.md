---
id: make
type: make
title: Score the storm forecast
files: [storms.py]
entry: storms.py
on_pass: { wendt: "Point one two. Nine storms in ten, and a few quiet nights lashed down. I can live with that." }
hints:
  nudge: "Precision and recall share a numerator. What's on the bottom of each: the warnings, or the storms? And where does the ROC curve start?"
  plan:
    - Count the four kinds of night
    - Draw the table
    - Precision, from the warnings; recall, from the real cases; F1 for both
    - Every threshold at once, from the highest chance down
    - Add up the area in trapezoids
    - The highest threshold that catches enough storms, and what it costs
  shape: |
    def confusion(y, warned):
        tp = int(np.sum((warned == 1) & (y == 1)))
        fp = int(np.sum((warned == ___) & (y == ___)))
        ...


    def roc_curve(y, chances):
        fpr, tpr = [0.0], [0.0]
        for threshold in np.unique(chances)[___]:
            tp, fp, fn, tn = confusion(y, (chances >= threshold).astype(int))
            tpr.append(tp / ___)
            fpr.append(fp / ___)
        return np.array(fpr), np.array(tpr)


    def auc(fpr, tpr):
        return float(np.sum((fpr[1:] - fpr[:-1]) * (___ + ___) / 2))
---
Now the whole notebook, properly. The requirements are at the top of `storms.py`.

```text
At a threshold of 0.5:
              storm   calm
warned           12      3
not warned       13    372
Accuracy 0.96, precision 0.80, recall 0.48, F1 0.60
Saying calm every night: accuracy 0.94, recall 0.00
AUC: 0.950
To catch 90% of storms, warn at 0.12 or more: precision 0.44, 29 false alarms
```

`np.unique(chances)` gives each distinct chance once, lowest first; `[::-1]` turns it round. With `fpr` and `tpr` as arrays, `fpr[1:] - fpr[:-1]` is every step along the bottom at once.

Accuracy says the forecast is barely better than saying calm. The rest of the lines say otherwise. Which one Wendt should care about is her decision, not the forecast's: the last line is what that decision costs.

The hidden checks try curves with tied chances, nights with nothing to divide by, and other thresholds and targets.
