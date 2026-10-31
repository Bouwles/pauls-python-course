"""The scores to beat: guessing evenly, and the bigram from the forecasts."""

import numpy as np

from notes import build_vocab, load_notes, split_notes, windows


def perplexity(chances):
    """e to the average of minus the log of each chance: the chances a model gave
    to the characters that really came next."""
    return float(np.exp(-np.mean(np.log(chances))))


def bigram_probs(X, y, size, smoothing=0.1):
    """Counts of each window's last character followed by its target, plus smoothing,
    each row divided by its total."""
    counts = np.zeros((size, size))
    for last, target in zip(X[:, -1], y):
        counts[last, target] += 1
    smoothed = counts + smoothing
    return smoothed / smoothed.sum(axis=1, keepdims=True)


def bigram_chances(probs, X, y):
    """The chance the bigram gives each window's real next character."""
    return probs[X[:, -1], y]


if __name__ == "__main__":
    notes = load_notes()
    learn, held_back = split_notes(notes)
    vocab = build_vocab(notes)
    X, y = windows(learn, vocab, 4)
    X_held, y_held = windows(held_back, vocab, 4)
    probs = bigram_probs(X, y, len(vocab))
    print(f"Guessing evenly: perplexity {len(vocab)}")
    print(f"Bigram on the held-back notes: perplexity {perplexity(bigram_chances(probs, X_held, y_held)):.2f}")
