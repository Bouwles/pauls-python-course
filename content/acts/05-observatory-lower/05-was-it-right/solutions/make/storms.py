"""Penhallow's storm notebook: the chance her forecast gave each evening,
and whether a storm came. How good was it?

confusion(y, warned)        (tp, fp, fn, tn) as whole numbers: y and warned
                            are arrays of 1s and 0s, one per night
precision(tp, fp)           the share of warnings that were right; 0.0 if
                            there were no warnings at all
recall(tp, fn)              the share of storms that were warned; 0.0 if
                            there were no storms at all
f1(p, r)                    the harmonic mean of a precision and a recall,
                            2 * p * r / (p + r); 0.0 if both are 0
roc_curve(y, chances)       (fpr, tpr): two arrays that start at 0.0 and 0.0,
                            then hold one false positive rate and one true
                            positive rate for each distinct chance, used as
                            the threshold (warn when chance >= threshold),
                            from the highest chance down to the lowest
auc(fpr, tpr)               the area under that curve, in trapezoids
threshold_for_recall(y, chances, target)
                            the highest distinct chance that, used as the
                            threshold, gives a recall of at least target

Run as a program, it prints:
At a threshold of 0.5:
              storm   calm
warned           12      3
not warned       13    372
Accuracy 0.96, precision 0.80, recall 0.48, F1 0.60
Saying calm every night: accuracy 0.94, recall 0.00
AUC: 0.950
To catch 90% of storms, warn at 0.12 or more: precision 0.44, 29 false alarms
"""
# Copied by Professor Wendt from the back page of the storm notebook:
# Lashed the shutters for nineteen storms that never came, and left them
# open for two that did. Tom says the sea wall gate is the same sum, with
# bigger numbers on both sides. Shut it for nothing and the boats miss a
# tide. Leave it open for a real one and the high street floods. A.P.

import numpy as np

THRESHOLD = 0.5
TARGET_RECALL = 0.9


def confusion(y, warned):
    tp = int(np.sum((warned == 1) & (y == 1)))
    fp = int(np.sum((warned == 1) & (y == 0)))
    fn = int(np.sum((warned == 0) & (y == 1)))
    tn = int(np.sum((warned == 0) & (y == 0)))
    return tp, fp, fn, tn


def precision(tp, fp):
    if tp + fp == 0:
        return 0.0
    return tp / (tp + fp)


def recall(tp, fn):
    if tp + fn == 0:
        return 0.0
    return tp / (tp + fn)


def f1(p, r):
    if p + r == 0:
        return 0.0
    return 2 * p * r / (p + r)


def roc_curve(y, chances):
    storms = np.sum(y == 1)
    calms = np.sum(y == 0)
    fpr = [0.0]
    tpr = [0.0]
    for threshold in np.unique(chances)[::-1]:
        tp, fp, fn, tn = confusion(y, (chances >= threshold).astype(int))
        tpr.append(tp / storms)
        fpr.append(fp / calms)
    return np.array(fpr), np.array(tpr)


def auc(fpr, tpr):
    return float(np.sum((fpr[1:] - fpr[:-1]) * (tpr[1:] + tpr[:-1]) / 2))


def threshold_for_recall(y, chances, target):
    for threshold in np.unique(chances)[::-1]:
        tp, fp, fn, tn = confusion(y, (chances >= threshold).astype(int))
        if recall(tp, fn) >= target:
            return float(threshold)


if __name__ == "__main__":
    table = np.loadtxt("storms.csv", delimiter=",", skiprows=1)
    chances = table[:, 1]
    y = table[:, 2].astype(int)

    # Count the four kinds of night
    warned = (chances >= THRESHOLD).astype(int)
    tp, fp, fn, tn = confusion(y, warned)

    # Draw the table
    print(f"At a threshold of {THRESHOLD}:")
    print("              storm   calm")
    print(f"warned       {tp:6} {fp:6}")
    print(f"not warned   {fn:6} {tn:6}")

    # Precision, recall and F1, against saying calm every night
    p, r = precision(tp, fp), recall(tp, fn)
    print(f"Accuracy {(tp + tn) / len(y):.2f}, precision {p:.2f}, recall {r:.2f}, F1 {f1(p, r):.2f}")
    print(f"Saying calm every night: accuracy {np.mean(y == 0):.2f}, recall 0.00")

    # Every threshold at once: the ROC curve and its area
    fpr, tpr = roc_curve(y, chances)
    print(f"AUC: {auc(fpr, tpr):.3f}")

    # The threshold that catches enough storms, and what it costs
    threshold = threshold_for_recall(y, chances, TARGET_RECALL)
    tp, fp, fn, tn = confusion(y, (chances >= threshold).astype(int))
    print(f"To catch {TARGET_RECALL:.0%} of storms, warn at {threshold:.2f} or more: "
          f"precision {precision(tp, fp):.2f}, {fp} false alarms")
