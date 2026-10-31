"""The digit reader, rebuilt in PyTorch."""

import torch
from torch import nn

from notebooks import load_split


def to_tensors(X, labels):
    """The greys as a float32 tensor, shape (n, 64); the labels as int64, shape (n,)."""
    # Numbers into tensors
    return torch.tensor(X, dtype=torch.float32), torch.tensor(labels, dtype=torch.long)


def blackboard_gradients():
    """dL/dw1 and dL/dw2 for the blackboard chain, worked out by autograd, as plain floats.

    The chain from Neural Network from Scratch: x = 2, w1 = 0.5, w2 = 3, target 1,
    and L = (w2 * relu(w1 * x) - target) ** 2.
    """
    # Tensors that remember how they were made: requires_grad=True
    w1 = torch.tensor(0.5, requires_grad=True)
    w2 = torch.tensor(3.0, requires_grad=True)
    # Forward, then backward
    loss = (w2 * torch.relu(w1 * 2.0) - 1.0) ** 2
    loss.backward()
    # Read each .grad, as a plain float
    return w1.grad.item(), w2.grad.item()


class DigitReader(nn.Module):
    """64 greys in, a score for each of the 10 digits out."""

    def __init__(self, hidden=32):
        super().__init__()
        # The layers: self.hidden, 64 to hidden; self.out, hidden to 10
        self.hidden = nn.Linear(64, hidden)
        self.out = nn.Linear(hidden, 10)

    def forward(self, x):
        """Raw scores, one row per digit, one column per answer. No softmax."""
        # The route: hidden layer, relu, out
        return self.out(torch.relu(self.hidden(x)))


def train(model, X, labels, epochs, batch_size, rate, seed):
    """Adam on the cross-entropy, in shuffled mini-batches. Returns the loss on all of X after each epoch."""
    # Loss and optimiser
    loss_fn = nn.CrossEntropyLoss()
    optimiser = torch.optim.Adam(model.parameters(), lr=rate)
    # A generator seeded with seed, for shuffling
    generator = torch.Generator().manual_seed(seed)
    losses = []
    for _ in range(epochs):
        order = torch.randperm(len(X), generator=generator)
        for start in range(0, len(X), batch_size):
            rows = order[start:start + batch_size]
            # The loop: zero, forward, loss, backward, step
            optimiser.zero_grad()
            loss = loss_fn(model(X[rows]), labels[rows])
            loss.backward()
            optimiser.step()
        # After each epoch, the loss on every row, without building a graph
        with torch.no_grad():
            losses.append(loss_fn(model(X), labels).item())
    return losses


def accuracy(model, X, labels):
    """The fraction of rows whose biggest score is on the right digit, as a float."""
    # Ask it, without building a graph
    with torch.no_grad():
        guesses = model(X).argmax(dim=1)
    return (guesses == labels).float().mean().item()


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
