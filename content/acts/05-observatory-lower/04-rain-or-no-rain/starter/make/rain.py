"""Penhallow's evenings: four readings, and whether it rained by midnight.

sigmoid(z)                  1 / (1 + e ** -z), for one number or a whole array
predict_proba(X, w, b)      the chance of rain for each row: the sigmoid of
                            X @ w + b
log_loss(y, p)              the mean log loss of chances p against answers y
                            (1 for rain, 0 for none), as one number
gradients(X, y, w, b)       (dw, db): the slopes of the log loss, with one
                            slope in dw for each reading
train(X, y, rate, steps)    start at w = all zeros, b = 0; take that many
                            steps downhill; return (w, b, losses), where
                            losses holds the log loss from before each step
decide(p, threshold=0.5)    an array with 1 for each chance at or above the
                            threshold and 0 for each below it
accuracy(y, predicted)      the share of predictions that match the answers

Run as a program, it uses rng = np.random.default_rng(4) to lock a quarter
of the evenings away for testing (train_test_split from tools.py), scales
with the training evenings' means and spreads, trains at a rate of 1.0 for
1,000 steps, and prints:
humidity         +1.72
pressure         -0.69
pressure_change  -2.13
cloud            +1.40
Test accuracy: 0.86
Always guessing dry: 0.60
Tonight: 78% chance of rain. Keep the dome shut.

If tonight's chance is below THRESHOLD, the last line ends "Open the dome."
"""
import numpy as np

from tools import fit_scaler, load_table, scale, train_test_split

FEATURES = ["humidity", "pressure", "pressure_change", "cloud"]
TONIGHT = [84.0, 1010.0, -0.8, 5.0]
THRESHOLD = 0.5


if __name__ == "__main__":
    X, y = load_table("evenings.csv")

    # Lock the test evenings away

    # Scale with the training evenings' ruler

    # Walk downhill on the log loss

    # Score the test evenings, against always guessing dry

    # Decide about tonight
