"""The same forecasts, learnt by gradient descent through embeddings instead of counted."""

import numpy as np


def load_forecasts(path="forecasts.txt"):
    """The forecasts as ids, and the vocabulary, as in words.py."""
    with open(path) as forecasts_file:
        text = forecasts_file.read()
    vocab = sorted(set(text))
    index = {char: i for i, char in enumerate(vocab)}
    return [index[char] for char in text], vocab


def counting_loss(ids, size, smoothing=0.1):
    """The average negative log likelihood of the counting model, for comparison."""
    counts = np.zeros((size, size))
    for a, b in zip(ids, ids[1:]):
        counts[a, b] += 1
    probs = (counts + smoothing) / (counts + smoothing).sum(axis=1, keepdims=True)
    return float(-np.mean(np.log([probs[a, b] for a, b in zip(ids, ids[1:])])))


def one_hot(ids, size):
    """One row per id: zeros, with a 1 in that id's column."""


def softmax(logits):
    """Each row turned into chances that add up to 1."""


def train(ids, size, dim, rate, steps, seed=0):
    """Learn an embedding E (size, dim) and weights W (dim, size) that guess each next id.
    Returns (E, W, losses), with the loss measured before each step."""
    # Every character but the last, as one-hot rows; every character but the first, as targets
    # Forward: look up each embedding, score every next character, softmax
    # Backward: chances minus the answers, then back through W and E
    # One step downhill


def nearest(E, vocab, char, count=3):
    """The count characters whose embeddings point most nearly the same way as char's."""


if __name__ == "__main__":
    ids, vocab = load_forecasts()
    E, W, losses = train(ids, len(vocab), dim=8, rate=4.0, steps=400)
    for step in range(0, 400, 100):
        print(f"Step {step}: loss {losses[step]:.3f}")
    print(f"Step 399: loss {losses[-1]:.3f}")
    print(f"Counting gets {counting_loss(ids, len(vocab)):.3f} on the same forecasts")
    for char in ["4", "."]:
        print(f"Nearest to {char!r}:", " ".join(repr(other) for other in nearest(E, vocab, char)))
