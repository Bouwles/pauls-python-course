"""Penhallow's dome neuron: should we open the dome tonight?"""

import numpy as np


def predict(weights, bias, night):
    """1 to open the dome, 0 to keep it shut."""
    # Weigh each reading, add them up, add the bias
    total = np.dot(weights, night) + bias
    # Above 0 means open
    return 1 if total > 0 else 0


def train(nights, labels, rate, epochs):
    """Learn from the log. Returns the weights, the bias and the mistakes per epoch."""
    # Start knowing nothing
    weights = np.zeros(len(nights[0]))
    bias = 0.0
    mistakes = []
    # Sweep through every example, at most `epochs` times
    for epoch in range(epochs):
        wrong = 0
        for night, label in zip(nights, labels):
            # Ask the neuron
            error = label - predict(weights, bias, night)
            # Nudge the weights by the error times the reading
            weights = weights + rate * error * night
            bias = bias + rate * error
            if error != 0:
                wrong += 1
        # Count the mistakes; stop after a clean sweep
        mistakes.append(wrong)
        if wrong == 0:
            break
    return weights, bias, mistakes


if __name__ == "__main__":
    log = np.loadtxt("nights.csv", delimiter=",", skiprows=1)
    nights = log[:, :3]
    labels = log[:, 3].astype(int)

    weights, bias, mistakes = train(nights, labels, rate=0.1, epochs=50)
    print(f"Learned in {len(mistakes)} epochs. Mistakes: {', '.join(str(m) for m in mistakes)}")
    print(f"Weights: cloud {weights[0]:.2f}, humidity {weights[1]:.2f}, "
          f"moon {weights[2]:.2f}, bias {bias:.2f}")

    tonight = np.array([0.15, 0.40, 0.30])
    verdict = "open the dome" if predict(weights, bias, tonight) == 1 else "keep it shut"
    print(f"Tonight: {verdict}")
