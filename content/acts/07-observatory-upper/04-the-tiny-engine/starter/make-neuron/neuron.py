"""The stargazing neuron again, on the tiny engine: smooth, so it can slide downhill."""

import csv

from engine import Value


class Neuron:
    """A weight per input and a bias, all Values, all starting at 0."""

    def __init__(self, n_inputs):
        """One weight for each of the n_inputs readings, and a bias."""
        # Start knowing nothing

    def __call__(self, inputs):
        """The chance the night goes ahead, as a Value, for one night's readings (plain numbers)."""
        # Weigh each reading, add them up, add the bias
        # Squash it with the sigmoid

    def parameters(self):
        """Every Value training should move: the weights, then the bias."""


def train(neuron, nights, labels, rate, steps):
    """Gradient descent on the mean squared error. Returns the loss at each step."""
    # For each step: every gradient back to 0
    # The mean squared error over every night
    # backward, then move each parameter against its gradient


if __name__ == "__main__":
    with open("nights.csv") as log:
        rows = list(csv.reader(log))[1:]
    nights = [[float(reading) for reading in row[:3]] for row in rows]
    labels = [int(row[3]) for row in rows]

    neuron = Neuron(3)
    losses = train(neuron, nights, labels, rate=2.0, steps=200)
    print(f"Loss: {losses[0]:.4f} at the start, {losses[-1]:.4f} at the end")

    agree = sum((neuron(night).data > 0.5) == (label == 1) for night, label in zip(nights, labels))
    print(f"Agrees with {agree} of {len(nights)} nights")

    chance = neuron([0.15, 0.40, 0.30]).data
    print(f"Tonight: {chance:.2f}, {'go ahead' if chance > 0.5 else 'call it off'}")
