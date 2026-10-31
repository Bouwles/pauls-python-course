"""Diabetes Risk Classifier: the chance that a survey respondent has
diabetes or prediabetes, from six answers, by logistic regression written
from scratch. Then scored honestly, because only about one in eight has it.

sigmoid(z)                  1 / (1 + e ** -z), for one number or a whole array
predict_proba(X, w, b)      the chance for each row: the sigmoid of X @ w + b
log_loss(y, p)              the mean log loss of chances p against answers y
                            (1 for diabetes, 0 for none), as one number
gradients(X, y, w, b)       (dw, db): the slopes of the log loss, with one
                            slope in dw for each column
train(X, y, rate, steps)    start at w = all zeros, b = 0; take that many
                            steps downhill; return (w, b, losses), where
                            losses holds the log loss from before each step
decide(p, threshold=0.5)    an array with 1 for each chance at or above the
                            threshold and 0 for each below it
accuracy(y, predicted)      the share of predictions that match the answers
confusion(y, flagged)       (tp, fp, fn, tn) as whole numbers: y and flagged
                            are arrays of 1s and 0s, one per respondent
precision(tp, fp)           the share of flags that were right; 0.0 if there
                            were no flags at all
recall(tp, fn)              the share of real cases that were flagged; 0.0 if
                            there were no real cases at all
f1(p, r)                    2 * p * r / (p + r); 0.0 if both are 0
roc_curve(y, chances)       (fpr, tpr): two arrays that start at 0.0 and 0.0,
                            then hold one false positive rate and one true
                            positive rate for each distinct chance used as
                            the threshold, from the highest chance down
auc(fpr, tpr)               the area under that curve, in trapezoids
threshold_for_recall(y, chances, target)
                            the highest distinct chance that, used as the
                            threshold, gives a recall of at least target

Run as a program, it uses rng = np.random.default_rng(4) to lock a quarter of
the respondents away for testing, scales with the training respondents'
ruler, trains at a rate of 1.0 for 1,000 steps, and prints:
bmi              +0.39
age_band         +0.30
high_bp          +0.58
high_chol        +0.27
general_health   +0.79
exercise         -0.04
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
"""

import numpy as np

from tools import fit_scaler, load_table, scale, train_test_split

FEATURES = ["bmi", "age_band", "high_bp", "high_chol", "general_health", "exercise"]
RESPONDENT = [31, 9, 1, 1, 3, 0]
THRESHOLD = 0.5
TARGET_RECALL = 0.85


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def predict_proba(X, w, b):
    return sigmoid(X @ w + b)


def log_loss(y, p):
    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))


def gradients(X, y, w, b):
    miss = predict_proba(X, w, b) - y
    dw = X.T @ miss / len(y)
    db = np.mean(miss)
    return dw, db


def train(X, y, rate, steps):
    # Start from a guess
    w = np.zeros(X.shape[1])
    b = 0.0
    losses = []
    for step in range(steps):
        # Measure the miss, and keep the loss
        losses.append(log_loss(y, predict_proba(X, w, b)))
        dw, db = gradients(X, y, w, b)
        # Step downhill
        w = w - rate * dw
        b = b - rate * db
    return w, b, losses


def decide(p, threshold=0.5):
    return (p >= threshold).astype(int)


def accuracy(y, predicted):
    return np.mean(y == predicted)


def confusion(y, flagged):
    tp = int(np.sum((flagged == 1) & (y == 1)))
    fp = int(np.sum((flagged == 1) & (y == 0)))
    fn = int(np.sum((flagged == 0) & (y == 1)))
    tn = int(np.sum((flagged == 0) & (y == 0)))
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
    cases = np.sum(y == 1)
    others = np.sum(y == 0)
    fpr = [0.0]
    tpr = [0.0]
    for threshold in np.unique(chances)[::-1]:
        tp, fp, fn, tn = confusion(y, decide(chances, threshold))
        tpr.append(tp / cases)
        fpr.append(fp / others)
    return np.array(fpr), np.array(tpr)


def auc(fpr, tpr):
    return float(np.sum((fpr[1:] - fpr[:-1]) * (tpr[1:] + tpr[:-1]) / 2))


def threshold_for_recall(y, chances, target):
    for threshold in np.unique(chances)[::-1]:
        tp, fp, fn, tn = confusion(y, decide(chances, threshold))
        if recall(tp, fn) >= target:
            return float(threshold)


if __name__ == "__main__":
    X, y = load_table("diabetes.csv")

    # Lock the test respondents away
    rng = np.random.default_rng(4)
    X_train, X_test, y_train, y_test = train_test_split(X, y, 0.25, rng)

    # Scale with the training respondents' ruler
    means, spreads = fit_scaler(X_train)
    X_train, X_test = scale(X_train, means, spreads), scale(X_test, means, spreads)

    # Walk downhill on the log loss
    w, b, losses = train(X_train, y_train, rate=1.0, steps=1000)
    for name, weight in zip(FEATURES, w):
        print(f"{name:<16} {weight:+.2f}")

    # Count the four kinds of respondent, on the test pile
    chances = predict_proba(X_test, w, b)
    tp, fp, fn, tn = confusion(y_test, decide(chances, THRESHOLD))
    print(f"At a threshold of {THRESHOLD}, on {len(y_test)} respondents it never saw:")
    print("              diabetes   none")
    print(f"flagged       {tp:8} {fp:6}")
    print(f"not flagged   {fn:8} {tn:6}")

    # Precision, recall and F1, against saying no to everyone
    p, r = precision(tp, fp), recall(tp, fn)
    print(f"Accuracy {accuracy(y_test, decide(chances, THRESHOLD)):.2f}, precision {p:.2f}, recall {r:.2f}, F1 {f1(p, r):.2f}")
    print(f"Saying no to everyone: accuracy {accuracy(y_test, np.zeros(len(y_test))):.2f}, recall 0.00")

    # Every threshold at once: the ROC curve and its area
    fpr, tpr = roc_curve(y_test, chances)
    print(f"AUC: {auc(fpr, tpr):.3f}")

    # A threshold for screening, chosen on the training respondents
    threshold = threshold_for_recall(y_train, predict_proba(X_train, w, b), TARGET_RECALL)
    tp, fp, fn, tn = confusion(y_test, decide(chances, threshold))
    print(f"To catch {TARGET_RECALL:.0%} of cases in training, flag at {threshold:.2f} or more.")
    print(f"On the test respondents: recall {recall(tp, fn):.2f}, precision {precision(tp, fp):.2f}, "
          f"{tp + fp} of {len(y_test)} flagged")

    # One respondent
    chance = predict_proba(scale(np.array([RESPONDENT], dtype=float), means, spreads), w, b)[0]
    print(f"Respondent: {chance:.0%} chance. {'Flag for a test.' if chance >= threshold else 'No flag.'}")
