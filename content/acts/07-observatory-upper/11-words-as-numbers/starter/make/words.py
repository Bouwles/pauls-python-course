"""Penhallow's forecast reader: characters as numbers, and a model that counts pairs."""

import numpy as np


# Every forecast since 1979, and every comment I ever wrote, in it goes.
# It knows how I talk now. It still doesn't know what I mean. A.P.
def build_vocab(text):
    """Every character in the text once, in sorted order."""


def encode(text, vocab):
    """The text as a list of ids: each character's place in vocab."""


def decode(ids, vocab):
    """The ids back into text."""


def count_pairs(ids, size):
    """counts[a, b]: how often character b comes straight after character a."""


def probabilities(counts, smoothing=0.1):
    """Add smoothing to every count, then make each row add up to 1."""


def average_nll(probs, ids):
    """The average of minus the log of each next character's chance."""


def perplexity(probs, ids):
    """e to the average negative log likelihood: how many characters it's choosing between."""


def sample(probs, start, length, rng):
    """length ids, each drawn with rng.choice from the row of the one before, starting after start."""


if __name__ == "__main__":
    with open("forecasts.txt") as forecasts_file:
        text = forecasts_file.read()
    with open("held_back.txt") as held_file:
        held_back = held_file.read()

    vocab = build_vocab(text)
    probs = probabilities(count_pairs(encode(text, vocab), len(vocab)))
    print(f"Vocabulary: {len(vocab)} characters")
    print(f"Perplexity on forecasts it never saw: {perplexity(probs, encode(held_back, vocab)):.2f}")
    print(f"Guessing evenly would be {len(vocab)}")

    rng = np.random.default_rng(1979)
    newline = vocab.index("\n")
    for _ in range(3):
        made_up = decode(sample(probs, newline, 120, rng), vocab)
        print(made_up.split("\n")[0])
