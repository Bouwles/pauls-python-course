"""Penhallow's dome neuron again, on the tiny engine: smooth, so it can slide downhill."""

import csv

from engine import Value


class Neuron:
    """A weight per input and a bias, all Values, all starting at 0."""

    def __init__(self, n_inputs):
        """One weight for each of the n_inputs readings, and a bias."""
        # Start knowing nothing
        self.weights = [Value(0.0) for _ in range(n_inputs)]
        self.bias = Value(0.0)

    def __call__(self, inputs):
        """The chance of opening, as a Value, for one night's readings (plain numbers)."""
        # Weigh each reading, add them up, add the bias
        total = self.bias
        for weight, reading in zip(self.weights, inputs):
            total = total + weight * reading
        # Squash it with the sigmoid
        return total.sigmoid()

    def parameters(self):
        """Every Value training should move: the weights, then the bias."""
        return self.weights + [self.bias]


def train(neuron, nights, labels, rate, steps):
    """Gradient descent on the mean squared error. Returns the loss at each step."""
    losses = []
    for _ in range(steps):
        # For each step: every gradient back to 0
        for parameter in neuron.parameters():
            parameter.grad = 0.0
        # The mean squared error over every night
        loss = sum((neuron(night) - label) ** 2 for night, label in zip(nights, labels)) / len(nights)
        losses.append(loss.data)
        # backward, then move each parameter against its gradient
        loss.backward()
        for parameter in neuron.parameters():
            parameter.data -= rate * parameter.grad
    return losses


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
    print(f"Tonight: {chance:.2f}, {'open the dome' if chance > 0.5 else 'keep it shut'}")
