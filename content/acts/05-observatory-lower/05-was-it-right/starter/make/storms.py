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


if __name__ == "__main__":
    table = np.loadtxt("storms.csv", delimiter=",", skiprows=1)
    chances = table[:, 1]
    y = table[:, 2].astype(int)

    # Count the four kinds of night

    # Draw the table

    # Precision, recall and F1, against saying calm every night

    # Every threshold at once: the ROC curve and its area

    # The threshold that catches enough storms, and what it costs
