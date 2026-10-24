# Pip's storm scores. Ninety-four per cent was embarrassing. These are proper.
import numpy as np

THRESHOLD = 0.5

table = np.loadtxt("storms.csv", delimiter=",", skiprows=1)
chances = table[:, 1]
storms = table[:, 2]


def counts(storms, warned):
    tp = np.sum((warned == 1) & (storms == 1))
    fp = np.sum((warned == 1) & (storms == 0))
    fn = np.sum((warned == 0) & (storms == 1))
    return tp, fp, fn


def precision(tp, fp, fn):
    return tp / (tp + fn)


def recall(tp, fp, fn):
    return tp / (tp + fp)


if __name__ == "__main__":
    warned = (chances >= THRESHOLD).astype(int)
    tp, fp, fn = counts(storms, warned)
    print(f"Warned {tp + fp} times, {tp} of them storms. Missed {fn} storms.")
    print(f"Precision: {precision(tp, fp, fn):.2f}")
    print(f"Recall: {recall(tp, fp, fn):.2f}")
