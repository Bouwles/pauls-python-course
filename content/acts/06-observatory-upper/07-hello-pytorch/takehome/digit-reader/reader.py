"""Penhallow's digit reader, rebuilt in PyTorch."""

import torch
from torch import nn

from notebooks import load_split


def to_tensors(X, labels):
    """The greys as a float32 tensor, shape (n, 64); the labels as int64, shape (n,)."""
    # Numbers into tensors


def blackboard_gradients():
    """dL/dw1 and dL/dw2 for the blackboard chain, worked out by autograd, as plain floats.

    The chain from Learning Backwards: x = 2, w1 = 0.5, w2 = 3, target 1,
    and L = (w2 * relu(w1 * x) - target) ** 2.
    """
    # Tensors that remember how they were made: requires_grad=True
    # Forward, then backward
    # Read each .grad, as a plain float


class DigitReader(nn.Module):
    """64 greys in, a score for each of the 10 digits out."""

    def __init__(self, hidden=32):
        super().__init__()
        # The layers: self.hidden, 64 to hidden; self.out, hidden to 10

    def forward(self, x):
        """Raw scores, one row per digit, one column per answer. No softmax."""
        # The route: hidden layer, relu, out


def train(model, X, labels, epochs, batch_size, rate, seed):
    """Adam on the cross-entropy, in shuffled mini-batches. Returns the loss on all of X after each epoch."""
    # Loss and optimiser
    # A generator seeded with seed, for shuffling
    # The loop: zero, forward, loss, backward, step
    # After each epoch, the loss on every row, without building a graph


def accuracy(model, X, labels):
    """The fraction of rows whose biggest score is on the right digit, as a float."""
    # Ask it, without building a graph


if __name__ == "__main__":
    X_learn, labels_learn, X_held, labels_held = load_split()
    X_learn, labels_learn = to_tensors(X_learn, labels_learn)
    X_held, labels_held = to_tensors(X_held, labels_held)

    torch.manual_seed(1)
    model = DigitReader()
    losses = train(model, X_learn, labels_learn, epochs=15, batch_size=32, rate=0.01, seed=2)
    print(f"Loss: {losses[0]:.3f} after the first epoch, {losses[-1]:.3f} after the last")

    read = round(accuracy(model, X_held, labels_held) * len(labels_held))
    print(f"Read {read} of {len(labels_held)} digits it had never seen")
