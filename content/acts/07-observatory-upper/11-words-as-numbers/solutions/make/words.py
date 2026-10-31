"""The forecast reader: characters as numbers, and a model that counts pairs."""

import numpy as np


def build_vocab(text):
    """Every character in the text once, in sorted order."""
    return sorted(set(text))


def encode(text, vocab):
    """The text as a list of ids: each character's place in vocab."""
    index = {char: i for i, char in enumerate(vocab)}
    return [index[char] for char in text]


def decode(ids, vocab):
    """The ids back into text."""
    return "".join(vocab[i] for i in ids)


def count_pairs(ids, size):
    """counts[a, b]: how often character b comes straight after character a."""
    counts = np.zeros((size, size))
    for a, b in zip(ids, ids[1:]):
        counts[a, b] += 1
    return counts


def probabilities(counts, smoothing=0.1):
    """Add smoothing to every count, then make each row add up to 1."""
    smoothed = counts + smoothing
    return smoothed / smoothed.sum(axis=1, keepdims=True)


def average_nll(probs, ids):
    """The average of minus the log of each next character's chance."""
    chances = [probs[a, b] for a, b in zip(ids, ids[1:])]
    return float(-np.mean(np.log(chances)))


def perplexity(probs, ids):
    """e to the average negative log likelihood: how many characters it's choosing between."""
    return float(np.exp(average_nll(probs, ids)))


def sample(probs, start, length, rng):
    """length ids, each drawn with rng.choice from the row of the one before, starting after start."""
    ids = []
    current = start
    for _ in range(length):
        current = int(rng.choice(len(probs), p=probs[current]))
        ids.append(current)
    return ids


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
